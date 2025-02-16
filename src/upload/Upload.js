import React, { Component } from "react";
import Dropzone from "../dropzone/Dropzone";
import "./Upload.css";
import Progress from "../progress/Progress";
import axios from 'axios';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Radar from "../radar/RadarChart";



class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false,
      data: [],
      display: ""
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.renderActions = this.renderActions.bind(this);
  }

  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }));
  }


  async uploadFiles() {
    this.setState({ uploadProgress: {}, uploading: true });
    const promises = [];
    this.state.files.forEach(file => {
      promises.push(this.sendRequest(file));
    });
    try {
      await Promise.all(promises);

      this.setState({ successfullUploaded: true, uploading: false });
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      this.setState({ successfullUploaded: true, uploading: false });
    }
  }

  async sendRequest(file) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener("progress", event => {
        if (event.lengthComputable) {
          const copy = { ...this.state.uploadProgress };
          copy[file.name] = {
            state: "pending",
            percentage: (event.loaded / event.total) * 100
          };
          this.setState({ uploadProgress: copy });
        }
      });

      req.upload.addEventListener("load", event => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: "done", percentage: 100 };
        this.setState({ uploadProgress: copy });
        resolve(req.response);
      });

      req.upload.addEventListener("error", event => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: "error", percentage: 0 };
        this.setState({ uploadProgress: copy });
        reject(req.response);
      });

      const formData = new FormData();
      formData.append("file", file, file.name);
      console.log(file)

      let currentComponent = this; 
      axios({
        method: 'post',
        url: 'https://vast-meadow-62722.herokuapp.com/upload',
        data: formData,
        config: { headers: { 'Content-type': 'multipart/form-data'}}   
      })
      .then(function(response){
        currentComponent.setState({ data: (response)})
        console.log(currentComponent.state.data)
      })
      .catch(function(response){
        console.log(response)
      })
    });
  }
  
  show(){
    this.setState({ display: 'none' })
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src="baseline-check_circle_outline-24px.svg"
            style={{
              opacity:
                uploadProgress && uploadProgress.state === "done" ? 0.5 : 0
            }}
          />
        </div>
      );
    }
  }

  renderActions() {
    if (this.state.successfullUploaded) {
      return (
        <button
          onClick={() =>
            this.setState({ files: [], successfullUploaded: false })
          }
        >
          Clear
        </button>
      );
    } else {
      return (
        <button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </button>
      );
    }
  }

  render() {
    let graph;

    if (this.state.data.length !== 0) {
      console.log(this.state.data)
      
      graph = <Route path="/radar" render={(props) => <Radar {...props} data={this.state.data} />}/>
    } else {
      graph = ""
    }

    return (
      <div className="Upload">
        <span className="Title">Upload Menu (XLS file)</span>
        <div className="Content">
          <div>
            <Dropzone
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            />
          </div>
          <div className="Files">
            {this.state.files.map(file => {
              return (
                <div key={file.name} className="Row">
                  <span className="Filename">{file.name}</span>
                  {this.renderProgress(file)}
                </div>
              );
            })}
          </div>
        </div>
        <HashRouter>
            {graph}
        <div>
        </div>
          <div className="Actions">
            {this.renderActions()}
            <NavLink to="/radar" onClick={()=> this.setState({display: "none"})} style={{display:this.state.display}}>
              <button disabled={this.state.data.length === 0}>
            Access report
              </button>
            </NavLink>
            <NavLink to="/">
              <button disabled={this.state.data.length === 0} onClick={() =>
            this.setState({ files: [], successfullUploaded: false, data: [], uploading: false, uploadProgress: {}, display: ""}) 
          } style={this.state.display.length == 0 ? {display: "none"} : {display: ""} }>     
            Get another report
              </button>
            </NavLink>
          </div>
        </HashRouter>
      </div>
    );
  }
}

export default Upload;
