import * as THREE from 'three';

import earthmap from '../../../assets/images/earthmap4k.jpg';
import earthbump from '../../../assets/images/earthbump4k.jpg';
import earthspec from '../../../assets/images/earthspec4k.jpg';

export const createEarth = () => {
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

    return new THREE.Mesh(earthGeometry, earthMaterial);
}