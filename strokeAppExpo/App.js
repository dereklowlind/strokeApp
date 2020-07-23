window.addEventListener = x => x; // temp fix
global.addEventListener = x => x;
// https://stackoverflow.com/questions/61429599/error-cloud-firestore-addeventlistener-is-not-a-function-react-native-firestor
// https://github.com/firebase/firebase-js-sdk/issues/2991
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Setting a timer']);
// https://github.com/facebook/react-native/issues/12981
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Clipboard, Image } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as firebase from 'firebase'
import 'firebase/firestore';


dataLog = []

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCrVof1rkY-6Z0THzwqMnTKbmk-y1-vQo",
  authDomain: "strokeapptest.firebaseapp.com",
  databaseURL: "https://strokeapptest.firebaseio.com",
  projectId: "strokeapptest",
  storageBucket: "strokeapptest.appspot.com",
  messagingSenderId: "513477141372",
  appId: "1:513477141372:web:9ab4d173d1b7f9a768baf9",
  measurementId: "G-PHVDZZY05C"
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export default class AccelerometerSensor extends React.Component {
  state = {
    accelerometerData: {},
    deviceType: 'leftPhone',
    recState: "stopped",
    processingPhoneData: false,
  }

  componentDidMount() {
    db.collection("test1").doc("recordState").onSnapshot((querySnapshot) => {
      this.setState({recState: querySnapshot.data().recState})
      //if Left Phone or Right Phone toggle record state
      if(!this._checkDeviceTypeActive("controller")){
        if(querySnapshot.data().recState == "stopped") {
          this._unsubscribe();
          // write to test1 the "master" struct
          db.collection("test1").doc(this.state.deviceType).set({
            data: JSON.stringify(dataLog),
          })
          // write to last entry of log1 if that entry does not have data filled in yet
          db.collection("log1").orderBy("datetime", "desc").limit(1).get().then((lastDataEntry) => {
            const docId = lastDataEntry.docs[0].id
            let docData = lastDataEntry.docs[0].data()
            if(this._checkDeviceTypeActive("leftPhone") && docData.leftPhone === ""){
              // setTimeout(() => console.log("write out leftphone"),4000) // sleep 1 s to let try and avoid race condition
              docData.leftPhone = JSON.stringify(dataLog)
              // db.collection("log1").doc(docId).set(docData)
              db.collection("log1").doc(docId).update({leftPhone:JSON.stringify(dataLog)})
              console.log("write out leftphone")
            }else if(this._checkDeviceTypeActive("rightPhone")  && docData.rightPhone === ""){
              // setTimeout(() => console.log("write out rightphone"),1000) // sleep 1 s to let try and avoid race condition
              docData.rightPhone = JSON.stringify(dataLog)
              // db.collection("log1").doc(docId).set(docData)
              db.collection("log1").doc(docId).update({rightPhone:JSON.stringify(dataLog)})
              console.log("write out rightphone")
            }
          })//.then
        } else {
          this._subscribe();
          // reset data log
          dataLog = []
        }
      }
    });
  }

  // uploadCSV = () => {
  //   var fileRef = this.state.deviceType + '.json';
  //   console.log('Uploading.' + fileRef);
  //   // Create a root reference
  //   var storageRef = firebase.storage().ref();

  //   storageRef.child(fileRef).putString(JSON.stringify(dataLog), 'base64')
  //   .then(snapshot => {
  //       console.log('Uploaded.');
  //   })
  //   .catch(function(error) {
  //     console.error("Error uploading document: ", error);
  // });
  // }

  _writeRecordState = (recState) => {
    console.log("rec state");
    db.collection("test1").doc("recordState").set({
      recState: recState,
    })
    .then(function() {
      console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }

  _addNewDataEntry = () => {
    db.collection("log1").add({
      datetime: new Date(),
      leftPhone: "",
      rightPhone: "",
    })
    .then(function() {
      console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }


  _remote_control_toggle = () => {
    if (this.state.recState == "recording") {
      console.log("stop recording");
      this._addNewDataEntry();
      this._writeRecordState("stopped");
    } else {
      console.log("start recording");
      this._writeRecordState("recording")
    }
  }
  _slow = () => {
    Accelerometer.setUpdateInterval(1000); 
  }

  _fast = () => {
    Accelerometer.setUpdateInterval(500);
  }

  _subscribe = () => {
    this._subscription = Accelerometer.addListener(accelerometerData => {
      this.setState({ accelerometerData });
    });
  }

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  }

  _checkDeviceTypeActive = (type) => {
    return this.state.deviceType == type
  }

  _sendHttpRequest = (leftPhone_json, rightPhone_json) => {
    console.log("in send http")
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"leftPhone": leftPhone_json, "rightPhone": rightPhone_json});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://us-central1-strokeappfunctiontest.cloudfunctions.net/function-1", requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result);
        return result;
      })
      .catch(error => console.log('error', error));
  }
  _processPhoneData = () => {
    const that = this;
    db.collection("test1").get().then(function(querySnapshot){
      that.setState({processingPhoneData: true}); // show processing
      let data = {}
      querySnapshot.forEach(function(doc){
        data[doc.id] = doc.data()
      });
      leftPhone_json = JSON.parse(data["leftPhone"]["data"])
      rightPhone_json = JSON.parse(data["rightPhone"]["data"])
      
      //send http request
      console.log("in send http")
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      var raw = JSON.stringify({"leftPhone": leftPhone_json, "rightPhone": rightPhone_json});
  
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
  
      fetch("https://us-central1-strokeappfunctiontest.cloudfunctions.net/function-1", requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log(result);
          that.setState({processingPhoneData: false}); // show image
        })
        .catch(error => console.log('error', error));
        
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
  }

  renderPhoneAndControllerButtons() {
    return (
      <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={() => this.setState({deviceType: "leftPhone"})} style={[styles.button, styles.middleButton, this._checkDeviceTypeActive("leftPhone") && styles.activeButton]}>
        <Text>Left Phone</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.setState({deviceType: "rightPhone"})} style={[styles.button, this._checkDeviceTypeActive("rightPhone") && styles.activeButton]}>
        <Text>Right Phone</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={() => this.setState({deviceType: "controller"})} style={[styles.button, this._checkDeviceTypeActive("controller") && styles.activeButton]}>
       <Text>Controller</Text>
      </TouchableOpacity> */}
    </View>
    )
  }

  renderRecordingState() {
    return (
      <Text style={{ fontWeight: 'bold' }}>{this.state.recState == "stopped" ? "Recording Stopped" : "Recording in Progress"}</Text>
    )
  }

  render() {
    let { x, y, z } = this.state.accelerometerData;
    let timeStr = Date.now();
    dataLog.push([timeStr,x,y,z]);
    // toggle image to reload it
    let showPhoneData = <Text>Processing Phone Data</Text>;
    // console.log(this.state.processingPhoneData);
    if(!this.state.processingPhoneData){ // if not processing phone data show image
    showPhoneData = <Image source={{uri:'https://firebasestorage.googleapis.com/v0/b/strokeapptest.appspot.com/o/Figure_1.png?alt=media&token=549833eb-3b62-45a5-92df-205df0f5670c'}} 
      style={{width: 700, height: 400}}
      />
    }
    if(this._checkDeviceTypeActive("controller")){
      return (
        <View style={styles.sensor}>
          <Text>Accelerometer:</Text>
          <Text>x: {round(x)} y: {round(y)} z: {round(z)}</Text>
      
          <Text>Selected device type: {this.state.deviceType == "leftPhone" ? 'Left Phone' : 'Right Phone'}</Text>
          {this.renderPhoneAndControllerButtons()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={this._remote_control_toggle} style={styles.button}>
              <Text>{this.state.recState == "stopped" ? 'Start' : 'Stop'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this._processPhoneData} style={styles.button}>
              <Text>Process Phone Data</Text>
            </TouchableOpacity>
          </View>
          <Text>{'\n'}</Text>
          {this.renderRecordingState()}
          
          {showPhoneData}
          <Text>{dataLog}</Text>
 
        </View> 
    );
    }else{ //if Left Phone or Right Phone
      return (
        <View style={styles.sensor}>
          <Text>Accelerometer:</Text>
          <Text>x: {round(x)} y: {round(y)} z: {round(z)}</Text>    
          <Text>Selected device type: {this.state.deviceType == "leftPhone" ? 'Left Phone' : 'Right Phone'}</Text>
          {this.renderPhoneAndControllerButtons()}
          <Text>{'\n'}</Text>
          {this.renderRecordingState()}
          <Text>{'\n'}</Text>
          <Text>{JSON.stringify(dataLog)}</Text>
        </View>
      )
    }     
  }
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  activeButton: {
    backgroundColor: '#a7c6eb',
  },
  sensor: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
});
