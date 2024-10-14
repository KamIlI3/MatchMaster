import React, { Component } from 'react';
import styles from './Globus.module.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { createEarth } from './helpers/earth';
import { createSkyBox } from './helpers/skyBox';
import { addLights } from './helpers/lights';
import { addCountryBorders } from './helpers/countries';
import { ShowCountryInfo, hideCountryInfo } from './helpers/tooltip';


import countriesData from './countries.geo.json';



class Globus extends Component {

  componentDidMount() {
    this.initScene();
    this.addListeners();
    this.startAnimation();
  }

  initScene = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.mount);
    this.controls.enableZoom = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(this.renderer.domElement);
    this.camera.position.z = 20;

    this.earthSphere = createEarth();
    this.scene.add(this.earthSphere);
    this.scene.background = createSkyBox();
    addLights(this.scene);
    addCountryBorders(this.earthSphere, countriesData);
  }

  addListeners = () => {
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (event) => {
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.earthSphere.children);

    if (intersects.length > 0) {
      const countryName = intersects[0].object.userData.name || 'Unknown Country';
      ShowCountryInfo(countryName, event.clientX, event.clientY); // Wywołanie metody do wyświetlenia informacji
    } else {
      hideCountryInfo(); // Ukrycie tooltipa, gdy nie ma przecięć
    }
  }

  handleWindowResize = () => {
    const { innerWidth, innerHeight } = window;
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  startAnimation = () => {
    requestAnimationFrame(this.startAnimation);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div ref={ref => (this.mount = ref)}></div>
    );
  }
}

export default Globus;
