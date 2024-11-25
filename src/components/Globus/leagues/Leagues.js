import React, { Component } from "react";
import styles from "../../css/Globus.module.css";
import * as THREE from "three";
import { FaStar } from "react-icons/fa";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchTopLeagues } from "../../api/fetchLeagues";

class Leagues extends Component {
  state = {
    leagues: [],
    favorites: [],
    error: null,
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLeagues();
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

  loadLeagues = async () => {
    try {
      const leagues = await fetchTopLeagues();
      this.setState({ leagues });
    } catch (error) {
      this.setState({ error: "Error fetching leagues" });
    }
  };

  startAnimation = () => {
    requestAnimationFrame(this.startAnimation);
    this.renderer.render(this.scene, this.camera);
  };

  toggleFavorite = (league) => {
    this.setState((prevState) => {
      const isFavorite = prevState.favorites.some(
        (fav) => fav.name === league.name
      );

      const updatedFavorites = isFavorite
        ? prevState.favorites.filter((fav) => fav.name !== league.name)
        : [...prevState.favorites, league];

      return { favorites: updatedFavorites };
    });
  };

  render() {
    const { leagues, favorites, error } = this.state;

    return (
      <div className={styles.globusContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.leaguesList}>
            {error && <p>{error}</p>}
            <h2>Leagues</h2>
            <ul>
              {leagues.length > 0 ? (
                leagues.map((league) => {
                  const isFavorite = favorites.some(
                    (fav) => fav.name === league.name
                  );

                  return (
                    <li key={league.name}>
                      <img
                        src={league.logo}
                        alt={`${league.name} logo`}
                        style={{
                          borderRadius: "5px",
                          width: "30px",
                          height: "30px",
                          marginRight: "8px",
                        }}
                      />
                      {league.name}
                      <FaStar
                        onClick={() => this.toggleFavorite(league)}
                        style={{
                          marginLeft: "8px",
                          cursor: "pointer",
                          color: isFavorite ? "gold" : "gray",
                        }}
                      />
                    </li>
                  );
                })
              ) : (
                <p>No leagues available</p>
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

export default Leagues;
