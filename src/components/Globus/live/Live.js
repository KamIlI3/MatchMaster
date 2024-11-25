import React, { Component } from "react";
import styles from "../../css/Live.module.css";
import * as THREE from "three";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchLiveMatches } from "../../api/fetchLiveMatches";

class Live extends Component {
  state = {
    liveMatches: [], // Przechowuje mecze na żywo
    favorites: [], // Przechowuje ulubione mecze
    error: null, // Przechowuje ewentualne błędy
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLiveMatches();
  }

  initScene = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(this.renderer.domElement);

    this.earthSphere = createEarth();
    this.scene.add(this.earthSphere);
    this.scene.background = createSkyBox();
  };

  startAnimation = () => {
    requestAnimationFrame(this.startAnimation);
    this.renderer.render(this.scene, this.camera);
  };

  loadLiveMatches = async () => {
    try {
      const liveMatches = await fetchLiveMatches();
      console.log("Filtered Live Matches:", liveMatches); // Sprawdź, co zwraca funkcja
      this.setState({ liveMatches });
    } catch (error) {
      console.error("Error loading live matches:", error);
      this.setState({ error: "Error fetching live matches" });
    }
  };

  render() {
    const { liveMatches, error } = this.state;

    return (
      <div className={styles.globusContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.liveMatches}>
            <h2>Live Matches</h2>
            {error && <p>{error}</p>}
            <ul>
              {liveMatches.length > 0 ? (
                liveMatches.map((match) => (
                  <li
                    key={match.fixture.id}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <strong>{match.teams.home.name}</strong> vs{" "}
                    <strong>{match.teams.away.name}</strong>
                    <p style={{ marginLeft: "10px" }}>
                      {match.league.name} - {match.fixture.status.elapsed || 0}{" "}
                      minutes
                    </p>
                  </li>
                ))
              ) : (
                <p>No live matches available</p>
              )}
            </ul>
          </div>

          <div
            className={styles.globeWrapper}
            ref={(ref) => (this.mount = ref)}
          />
        </div>
      </div>
    );
  }
}

export default Live;
