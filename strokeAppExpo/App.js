window.addEventListener = x => x; // temp fix
global.addEventListener = x => x;
// https://stackoverflow.com/questions/61429599/error-cloud-firestore-addeventlistener-is-not-a-function-react-native-firestor
// https://github.com/firebase/firebase-js-sdk/issues/2991

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
    deviceType: 'phone1',
    recState: "stopped",
    processingPhoneData: false,
  }

  componentDidMount() {
    db.collection("test1").doc("recordState").onSnapshot((querySnapshot) => {
      this.setState({recState: querySnapshot.data().recState})
      //if phone 1 or phone 2 toggle record state
      if(!this._checkDeviceTypeActive("controller")){
        if(querySnapshot.data().recState == "stopped") {
          this._unsubscribe();
          db.collection("test1").doc(this.state.deviceType).set({
            data: JSON.stringify(dataLog),
          })
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


  _remote_control_toggle = () => {
    if (this.state.recState == "recording") {
      console.log("stop recording");
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

  _sendHttpRequest = (phone1_json, phone2_json) => {
    console.log("in send http")
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"phone1": phone1_json, "phone2": phone2_json});

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
      phone1_json = JSON.parse(data["phone1"]["data"])
      phone2_json = JSON.parse(data["phone2"]["data"])
      
      //send http request
      console.log("in send http")
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      var raw = JSON.stringify({"phone1": phone1_json, "phone2": phone2_json});
  
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
      <TouchableOpacity onPress={() => this.setState({deviceType: "phone1"})} style={[styles.button, styles.middleButton, this._checkDeviceTypeActive("phone1") && styles.activeButton]}>
        <Text>Phone 1</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.setState({deviceType: "phone2"})} style={[styles.button, this._checkDeviceTypeActive("phone2") && styles.activeButton]}>
        <Text>Phone 2</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => this.setState({deviceType: "controller"})} style={[styles.button, this._checkDeviceTypeActive("controller") && styles.activeButton]}>
       <Text>Controller</Text>
      </TouchableOpacity>
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
    let time = new Date();
    let timeStr = time.toLocaleTimeString() + "." + time.getMilliseconds();
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
      
          <Text>Selected device type: {this.state.deviceType}</Text>
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
    }else{ //if phone 1 or phone 2
      return (
        <View style={styles.sensor}>
          <Text>Accelerometer:</Text>
          <Text>x: {round(x)} y: {round(y)} z: {round(z)}</Text>    
          <Text>Selected device type: {this.state.deviceType}</Text>
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
