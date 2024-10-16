import React, { Component } from 'react';
import styles from './Globus.module.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'; // Importujemy CSS2DRenderer

import { createEarth } from './helpers/earth';
import { createSkyBox } from './helpers/skyBox';
import { addLights } from './helpers/lights';
import { addCountryBorders } from './helpers/countries';


import countriesData from './countries.geo.json';
import * as turf from '@turf/turf';



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

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.mount.appendChild(this.labelRenderer.domElement);

    this.earthSphere = createEarth();
    this.scene.add(this.earthSphere);
    this.scene.background = createSkyBox();
    addLights(this.scene);
    addCountryBorders(this.earthSphere, countriesData);

    this.loadGeoJsonData(countriesData);
  }

  addListeners = () => {
    window.addEventListener('resize', this.handleWindowResize);
  }

  addCountryLabels = (feature) => {
    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      try{
        const centroid = turf.centroid(feature);

        const [longitude, latitude] = centroid.geometry.coordinates;
        if (typeof longitude !== 'number' || typeof latitude !== 'number') {
          console.warn('Nieprawidłowe współrzędne dla kraju:', feature.properties.name);
          return;
        }

        const radius = 10;
        const phi = (90 - latitude) * (Math.PI / 180);
        const theta = ( longitude + 180 ) * (Math.PI / 180 );
        
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const countryLabelDiv = document.createElement('div');
        countryLabelDiv.className = styles.countryLabel;
        countryLabelDiv.textContent = feature.properties.name;

        const countryLabel = new CSS2DObject(countryLabelDiv);
        countryLabel.position.set(x, y, z);

        this.earthSphere.add(countryLabel);
      } catch (error){
        console.error('Błąd przy obliczaniu centroidu dla kraju:', feature.properties.name, error);
      }
      } else {
        console.warn('Pomijanie kraju o nieobsługiwanym typie geometrii:', feature.properties.name, feature.geometry.type);
      }
    }
  

  handleWindowResize = () => {
    const { innerWidth, innerHeight } = window;
    this.renderer.setSize(innerWidth, innerHeight);
    this.labelRenderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  startAnimation = () => {
    requestAnimationFrame(this.startAnimation);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  loadGeoJsonData = (geoJsonData) => {
    geoJsonData.features.forEach((feature) => {
      this.addCountryLabels(feature);
    });
  }

  render() {
    return (
      <div ref={ref => (this.mount = ref)}></div>
    );
  }
}

export default Globus;
