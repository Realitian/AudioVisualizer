import React, { Component } from "react";
import App from "./Visual";
import "./App.css";

class Mic extends Component {
  state = {
    source: "",
    audioCtx: "",
    shader: "",
    canvas: "",
    visualNumber: 11
  };
  componentDidMount() {
    let { source, audioCtx } = this.state;

    audioCtx = new AudioContext();

    navigator.mediaDevices
      .getUserMedia({
        audio: true
      })
      .then((stream) => {
        source = audioCtx.createMediaStreamSource(stream);

        this.setState({
          source,
          audioCtx
        });
      });

    this.getVisual(11);
  }
  getVisual = (n) => {
    fetch(`./${n}.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then((r) => r.json())
      .then((data) => {
        this.setState({ visualNumber: n, shader: data.shader });
      });
  };
  componentDidUpdate = () => {
    const canvas = document.getElementById("visualizerCanvas");
    if (this.state.canvas !== canvas) {
      this.setState({
        canvas
      });
    }
  };
  changeVisual = (e) => {
    let value =
      parseFloat(this.state.visualNumber) + parseFloat(e.target.value);
    console.log(value);
    if (value > 0 && value < 17) {
      // this.setState({ visualNumber: value });
      this.getVisual(value);
    }
  };
  render() {
    return (
      <>
        {this.state.audioCtx && this.state.canvas && this.state.shader ? (
          <div>
            <App
              source={this.state.source}
              audioCtx={this.state.audioCtx}
              shader={this.state.shader}
              canvas={this.state.canvas}
            />
          </div>
        ) : null}
        <div id="next">
          <button onClick={this.changeVisual} value={1}>
            Next
          </button>
        </div>
        <div id="prev">
          <button onClick={this.changeVisual} value={-1}>
            Previous
          </button>
        </div>
        <canvas id="visualizerCanvas"></canvas>
      </>
    );
  }
}

export default Mic;
