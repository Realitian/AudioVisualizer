import React, { Component } from "react";
import * as THREE from "three";
import "./App.css";
let uniforms,
  scene,
  renderer,
  animateTimeout,
  resizeTimeout,
  analyser,
  audioData,
  lastMaterial;
class App extends Component {
  state = {
    lastVisual: null,
    scene: null
    // ,
    // material: null
  };
  componentDidMount = () => {
    // console.log("didmount");
    this.startVisual(analyser);
    
  };
  componentDidUpdate = async () => {
    console.log("didupdate");
    // console.trace();
    // if (this.props.shader !== this.state.lastVisual) {
    //   if (scene) {
    //     await this.clearThree();
    //     uniforms = null;
    //     scene = null;

    //     clearTimeout(animateTimeout);
    //     clearTimeout(resizeTimeout);
    //   }
    //   this.startVisual();
    // }
    
    console.log("scene", this.props.shader);
    scene.children[0].material.setValues({
      fragmentShader: this.props.shader,
      uniforms
    });
    scene.children[0].material.needsUpdate = true;
  };
  clearThree = () => {
    renderer.clear();
    scene.traverse((object) => {
      if (!object.isMesh) return;

      object.geometry.dispose();

      if (object.material.isMaterial) {
        this.cleanMaterial(object.material);
      } else {
        // an array of materials
        for (const material of object.material) this.cleanMaterial(material);
      }
    });
    return;
  };

  cleanMaterial = (material) => {
    material.dispose();
    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === "object" && "minFilter" in value) {
        value.dispose();
      }
    }
  };
  startVisual = async () => {
    window.cancelAnimationFrame(animate);

    let { source, audioCtx } = this.props;
    let shader = this.props.shader;
    const canvas = this.props.canvas;

    if (!analyser) {
      console.log("new ana");
      analyser = audioCtx.createAnalyser();
      source.connect(analyser);
    }
    if (!audioData) {
      audioData = new Uint8Array(analyser.frequencyBinCount);
    }

    if (!renderer) {
      console.log("new renderer");
      renderer = new THREE.WebGLRenderer({ canvas });
    } else {
      //renderer.dispose();
      renderer.clear();
    }

    const camera = new THREE.OrthographicCamera(
      -1, // left
      1, // right
      1, // top
      -1, // bottom
      -1, // near,
      1 // far
    );

    if (canvas) {
      audioCtx.resume();
      createScene();
      animateTimeout = setTimeout(() => animate(), 144 / 1000);
    }

    // renderer.autoClearColor = false;

    function createScene() {
      if (!scene) {
        scene = new THREE.Scene();
      }
      const plane = new THREE.PlaneBufferGeometry(2, 2);

      uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3() },
        iChannel0: {
          value: new THREE.DataTexture(
            audioData,
            analyser.fftSize / 2,
            1,
            THREE.LuminanceFormat
          )
        },
        iChannel1: {
          value: new THREE.DataTexture(
            audioData,
            analyser.fftSize / 2,
            1,
            THREE.LuminanceFormat
          )
        },
        iChannel2: {
          value: new THREE.DataTexture(
            audioData,
            analyser.fftSize / 2,
            1,
            THREE.LuminanceFormat
          )
        },
        iChannel3: {
          value: new THREE.DataTexture(
            audioData,
            analyser.fftSize / 2,
            1,
            THREE.LuminanceFormat
          )
        }
      };

      lastMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader,
        uniforms
      });

      scene.add(new THREE.Mesh(plane, lastMaterial));
    }

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    function resizeRendererToDisplaySize(renderer) {
      const needResize =
        canvas.width !== window.innerWidth ||
        canvas.height !== window.innerHeight;
      if (needResize) {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      return needResize;
    }

    function animate(time) {
      //console.log(timeouts);
      animateTimeout = setTimeout(
        () => requestAnimationFrame(animate),
        144 / 1000
      );

      resizeTimeout = setTimeout(
        () => resizeRendererToDisplaySize(renderer, canvas),
        144 / 1000
      );

      analyser.getByteFrequencyData(audioData);

      time *= 0.001;

      uniforms.iTime.value = time;
      uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
      uniforms.iChannel0.value.needsUpdate = true;

      renderer.render(scene, camera);
    }
  };

  render() {
    return <div />;
  }
}

export default App;
