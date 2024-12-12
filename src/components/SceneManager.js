import React, { useEffect, useRef, createContext } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { createSkyBox } from "./Globus/helpers/skyBox";

export const SceneContext = createContext();

const SceneManager = ({ children }) => {
  const mountRef = useRef(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const labelRenderer = new CSS2DRenderer();
  const controls = new OrbitControls(camera, renderer.domElement);

  useEffect(() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(labelRenderer.domElement);

    camera.position.z = 40;

    // Add common skybox to the scene
    const skyBox = createSkyBox();
    scene.background = skyBox;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      scene.background = null; // Clean up skybox
    };
  }, []);

  return (
    <SceneContext.Provider value={{ scene, camera, labelRenderer }}>
      <div ref={mountRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }} />
      {children}
    </SceneContext.Provider>
  );
};

export default SceneManager;
