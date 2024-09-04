import React, {Component} from 'react';
import styles from './Globus.module.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import earthmap from '../../assets/images/earthmap4k.jpg'
import earthbump from '../../assets/images/earthbump4k.jpg'
// import earthhiresclouds from '../../assets/images/earthhiresclouds4K.jpg'
// import earthlights from '../../assets/images/earthlights4k.jpg'
import earthspec from '../../assets/images/earthspec4k.jpg'

import space_right from '../../assets/images/space_right.png'
import space_left from '../../assets/images/space_left.png'
import space_top from '../../assets/images/space_top.png'
import space_bot from '../../assets/images/space_bot.png'
import space_back from '../../assets/images/space_back.png'
import space_front from '../../assets/images/space_front.png'


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

  this.addEarth();
  this.addSkyBox();
  this.addLight();
}

addEarth = () => {
  
  const earthMap = new THREE.TextureLoader().load( earthmap );
  const earthBumpMap = new THREE.TextureLoader().load( earthbump );
  const earthSpecMap = new THREE.TextureLoader().load( earthspec );

  const earthGeometry = new THREE.SphereGeometry( 10, 32, 32 );
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    bumpMap: earthBumpMap,
    bumpScale: 0.1,
    specularMap: earthSpecMap,
    specular: new THREE.Color('gray')
  });

  this.earthSphere = new THREE.Mesh( earthGeometry, earthMaterial );
  this.earthSphere.name = "EarthSphere";
  this.scene.add( this.earthSphere );
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
  const sunLights =  [];
    sunLights[0] = new THREE.DirectionalLight(0xffffff, 1);
    sunLights[1] = new THREE.DirectionalLight(0xffffff, 1);
    sunLights[2] = new THREE.DirectionalLight(0xffffff, 1);
    sunLights[3] = new THREE.DirectionalLight(0xffffff, 1);
    sunLights[4] = new THREE.DirectionalLight(0xffffff, 1);
    sunLights[5] = new THREE.DirectionalLight(0xffffff, 1);

    sunLights[0].position.set(0, 0, 1);
    sunLights[1].position.set(0, 0, -1); 
    sunLights[2].position.set(0, 1, 0);
    sunLights[3].position.set(0, -1, 0); 
    sunLights[4].position.set(1, 0, 0);
    sunLights[5].position.set(-1, 0, 0); 

    this.scene.add(sunLights[0]); 
    this.scene.add(sunLights[1]);
    this.scene.add(sunLights[2]); 
    this.scene.add(sunLights[3]);
    this.scene.add(sunLights[4]); 
    this.scene.add(sunLights[5]);

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
