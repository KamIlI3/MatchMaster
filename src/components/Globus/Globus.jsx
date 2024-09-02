import React, {Component} from 'react';
import styles from './Globus.module.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Globus extends Component{

componentDidMount() {
  this.createScene();
  this.startAnimation();

  window.addEventListener('resize', this.handleWindowResize);
}

createScene = () => {
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.controls = new OrbitControls(this.camera, this.mount);
  this.controls.enableZoom = true;

  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.mount.appendChild(this.renderer.domElement);
  this.camera.position.z = 20;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
  const cube = new THREE.Mesh( geometry, material);
  this.scene.add(cube);
}

startAnimation = () => {
  this.requestID = window.requestAnimationFrame(this.startAnimation);
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
}

handleWindowResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  this.renderer.setSize(width, height);
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
}
  render() {
    return(
      <div
      ref={ref => (this.mount = ref)}
      ></div>
    )
  }
}

export default Globus;
