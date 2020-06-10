import React from 'react'

class FileDownloader extends React.Component {
  downloadTxtFile = () => {
    const element = document.createElement("a");
    const jsonContents = {
      id: this.props.rawData.id,
      data: this.props.rawData.data(),
    }
    console.log(jsonContents)
    const file = new Blob([JSON.stringify(jsonContents)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = this.props.rawData.id + ".json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }
  
    render() {
      return (
        <div>
        {/* <a>Download JSON File </a> */}
          <button onClick={this.downloadTxtFile}>Download json</button>
        </div>
      );
    }
  }

  export default FileDownloader;