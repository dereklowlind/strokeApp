import React from 'react';
import * as firebase from 'firebase'
import 'firebase/firestore';
import {Button, TextField} from '@material-ui/core';
import DataEntriesTable from './components/DataEntriesTable'

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
    deviceType: 'controller',
    recState: "stopped",
    processingPhoneData: false,
    dataEntries: "",
    description: "",
  }

  componentDidMount() {
    // db.collection("log1").orderBy("datetime", "desc").limit(1).get().then((lastDataEntry) => {
    //   const docId = lastDataEntry.docs[0].id
    //   let docData = lastDataEntry.docs[0].data()
    //   if( true && docData.leftPhone === ""){
    //     docData.leftPhone = "set data"
    //     db.collection("log1").doc(docId).set(docData)
    //   }else if( true && docData.rightPhone === ""){
    //     docData.rightPhone = "set data"
    //     db.collection("log1").doc(docId).set(docData)
    //   }
    // })
    db.collection("log1").orderBy("datetime", "desc").onSnapshot((dataEntries) => {
      this.setState({dataEntries: dataEntries})
    })
    db.collection("test1").doc("recordState").onSnapshot((querySnapshot) => {
      this.setState({recState: querySnapshot.data().recState})
    });
  }

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
      description: this.state.description,
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
    if (this.state.recState === "recording") {
      console.log("stop recording");
      this._addNewDataEntry();
      this._writeRecordState("stopped");
    } else {
      console.log("start recording");
      this._writeRecordState("recording")
    }
  }

  _processPhoneData = () => {
    const that = this;
    db.collection("test1").get().then(function(querySnapshot){
      that.setState({processingPhoneData: true}); // show processing
      let data = {}
      querySnapshot.forEach(function(doc){
        data[doc.id] = doc.data()
      });
      let leftPhone_json = JSON.parse(data["leftPhone"]["data"])
      let rightPhone_json = JSON.parse(data["rightPhone"]["data"])
      
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
        .then(result => {
          console.log(result);
          that.setState({processingPhoneData: false}); // show image
        })
        .catch(error => console.log('error', error));
        
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
  }


  render() {
    // toggle image to reload it
    let showPhoneData = <div>Processing Phone Data</div>;
    // console.log(this.state.processingPhoneData);
    if(!this.state.processingPhoneData){ // if not processing phone data show image
    showPhoneData = <img style={{width: "100%"}} src='https://firebasestorage.googleapis.com/v0/b/strokeapptest.appspot.com/o/Figure_1.png?alt=media&token=549833eb-3b62-45a5-92df-205df0f5670c'/>
    }

    
    
    return (
    <div>
      <TextField id="standard-basic" label="Description"
        onChange ={(event) => this.setState({description: event.target.value})}>
      </TextField>
      <Button onClick={this._remote_control_toggle} >
        {this.state.recState == "stopped" ? 'Start' : 'Stop'}
        </Button>
      <Button onClick={this._processPhoneData} >
          Process Phone Data
      </Button>
      <div>Recording State: {this.state.recState}</div>
      
      {showPhoneData}
      <DataEntriesTable dataEntries={this.state.dataEntries} />
    </div> 
    );
    
  }
}
