import React from 'react'

class FileDownloaderCsv extends React.Component {
  downloadTxtFile = () => {
    const element = document.createElement("a");
    const header = "leftTime,leftX,leftY,leftZ,rightTime,rightX,rightY,rightZ\n"
    let csvContents = header

    // console.log(this.props.rawData.data().leftPhone);
    // data is stored as a json string
    const leftPhoneStr = this.props.rawData.data().leftPhone;
    const rightPhoneStr = this.props.rawData.data().rightPhone;

    // initialize arrays empty
    let leftPhone = [];
    let rightPhone = [];
    if(leftPhoneStr != ""){ // if data exists parse it
        leftPhone = JSON.parse(leftPhoneStr);
    }
    if(rightPhoneStr != ""){ // if data exists parse it
        rightPhone = JSON.parse(rightPhoneStr);
    }

    // find which array is longer
    let longest = leftPhone.length;
    if(rightPhone.length > longest){
        longest = rightPhone.length;
    }

    // find start time
    let startTime = 0;
    if(leftPhone.length > 0){
        startTime = leftPhone[0][0];
    }
    if(rightPhone.length > 0 && rightPhone[0][0] < startTime){
        startTime = rightPhone[0][0];
    }
    

    for(var i = 0; i < longest; i++){
        // initialize empty
        let leftPhoneRow = ",,,,";
        let rightPhoneRow = ",,,\n";
        if(i < leftPhone.length){
            leftPhoneRow = `${leftPhone[i][0]-startTime},${leftPhone[i][1]},${leftPhone[i][2]},${leftPhone[i][3]},`;
        }
        if(i < rightPhone.length){
            rightPhoneRow = `${rightPhone[i][0]-startTime},${rightPhone[i][1]},${rightPhone[i][2]},${rightPhone[i][3]}\n`;
        }
        // append the row to the csvContents
        csvContents += leftPhoneRow + rightPhoneRow;
    }

    console.log(csvContents);
    const file = new Blob([csvContents], { type: 'text/csv;charset=utf-8;' })
    element.href = URL.createObjectURL(file);
    element.download = this.props.rawData.id + ".csv";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }
  
    render() {
      return (
        <div>
        {/* <a>Download JSON File </a> */}
          <button onClick={this.downloadTxtFile}>Download CSV</button>
        </div>
      );
    }
  }

  export default FileDownloaderCsv;