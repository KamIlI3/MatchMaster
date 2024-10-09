import React, { Component } from 'react';
import styles from './Globus.module.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import earthmap from '../../assets/images/earthmap4k.jpg';
import earthbump from '../../assets/images/earthbump4k.jpg';
import earthspec from '../../assets/images/earthspec4k.jpg';

import space_right from '../../assets/images/space_right.png';
import space_left from '../../assets/images/space_left.png';
import space_top from '../../assets/images/space_top.png';
import space_bot from '../../assets/images/space_bot.png';
import space_back from '../../assets/images/space_back.png';
import space_front from '../../assets/images/space_front.png';

import countriesData from './countries.geo.json';

class Globus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCountry: null,  // Nazwa aktualnego kraju
    };
  }

  componentDidMount() {
    this.createScene();
    this.startAnimation();
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.addCountryBorders(countriesData);
  }

  createScene = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.mount);
    this.controls.enableZoom = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(this.renderer.domElement);
    this.camera.position.z = 20;

    this.addEarth();
    this.addSkyBox();
    this.addLight();
  }

  addEarth = () => {
    const earthMap = new THREE.TextureLoader().load(earthmap);
    const earthBumpMap = new THREE.TextureLoader().load(earthbump);
    const earthSpecMap = new THREE.TextureLoader().load(earthspec);

    const earthGeometry = new THREE.SphereGeometry(10, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      bumpMap: earthBumpMap,
      bumpScale: 0.1,
      specularMap: earthSpecMap,
      specular: new THREE.Color('gray'),
    });

    this.earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
    this.earthSphere.name = "EarthSphere";
    this.scene.add(this.earthSphere);
  }

  addSkyBox = () => {
    const skyBox = new THREE.CubeTextureLoader().load([
      space_right,
      space_left,
      space_top,
      space_bot,
      space_front,
      space_back,
    ]);
    this.scene.background = skyBox;
  }

  addLight = () => {
    const sunLights = [];
    for (let i = 0; i < 6; i++) {
      sunLights[i] = new THREE.DirectionalLight(0xffffff, 1);
      this.scene.add(sunLights[i]);
    }

    sunLights[0].position.set(0, 0, 1);
    sunLights[1].position.set(0, 0, -1);
    sunLights[2].position.set(0, 1, 0);
    sunLights[3].position.set(0, -1, 0);
    sunLights[4].position.set(1, 0, 0);
    sunLights[5].position.set(-1, 0, 0);
  }

  addCountryBorders = (geojson) => {
    geojson.features.forEach((country) => {
      if (!country.geometry || !country.properties) {
        console.warn('Missing geometry or properties for country:', country);
        return; // pomiń, jeśli brakuje danych
      }

      const { coordinates, type } = country.geometry;
      const countryName = country.properties.ADMIN ? country.properties.ADMIN : 'Unknown Country';

      if (type === "Polygon" || type === "MultiPolygon") {
        coordinates.forEach(polygon => {
          const borderLine = this.addPolygonBorder(polygon);
          borderLine.userData.name = countryName; // Dodanie nazwy kraju do obiektu granicy
        });
      }
    });
  }

  addPolygonBorder = (polygon) => {
    const points = [];
    polygon.forEach((ring) => {
      ring.forEach(([lon, lat]) => {
        const radius = 10;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        points.push(new THREE.Vector3(x, y, z));
      });
    });

    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
    const borderGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const borderLine = new THREE.Line(borderGeometry, borderMaterial);
    this.earthSphere.add(borderLine);
    return borderLine;
  }

  ShowCountryInfo = (countryName, x, y) => {
    let tooltip = document.getElementById('country-info');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'country-info';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Upewnij się, że 'backgroundColor' jest poprawnie zapisane
      tooltip.style.color = '#fff';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '5px';
      document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = countryName;
    tooltip.style.left = `${x + 10}px`; // Ustalanie pozycji
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.display = 'block';
  }

  hideCountryInfo = () => {
    const tooltip = document.getElementById('country-info');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  handleMouseMove = (event) => {
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.earthSphere.children);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      const countryName = intersected.userData.name || 'Unknown Country';
      this.ShowCountryInfo(countryName, event.clientX, event.clientY); // Wywołanie metody do wyświetlenia informacji
    } else {
      this.hideCountryInfo(); // Ukrycie tooltipa, gdy nie ma przecięć
    }
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
    return (
      <div ref={ref => (this.mount = ref)}></div>
    );
  }
}

export default Globus;
