import * as THREE from 'three';

export const addLights = (scene) => {
    const sunLights = [];
    for (let i = 0; i < 6; i++) {
      sunLights[i] = new THREE.DirectionalLight(0xffffff, 1);
      scene.add(sunLights[i]);
    }

    sunLights[0].position.set(0, 0, 1);
    sunLights[1].position.set(0, 0, -1);
    sunLights[2].position.set(0, 1, 0);
    sunLights[3].position.set(0, -1, 0);
    sunLights[4].position.set(1, 0, 0);
    sunLights[5].position.set(-1, 0, 0);
}