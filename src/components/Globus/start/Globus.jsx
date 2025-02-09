import React, { Component } from "react";
import styles from "../../css/Globus.module.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { FaStar } from "react-icons/fa";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";
import { addLights } from "../helpers/lights";
import { addCountryBorders } from "../helpers/countries";

import countriesData from "../../countries.geo.json";
import * as turf from "@turf/turf";

import loadLeagues from "../services/loadLeagues";

import { useNavigate } from "react-router-dom";

class Globus extends Component {
  state = {
    leagues: [],
    favorites: [],
    error: null,
    showLoginPrompt: false,
  };

  componentDidMount() {
    loadLeagues(this.setState.bind(this));
    this.initScene();
    this.addListeners();
    this.startAnimation();

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    this.setState({ favorites: storedFavorites });
  }

  //Scena
  initScene = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.controls = new OrbitControls(this.camera, this.mount);
    this.controls.enableZoom = true;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(this.renderer.domElement);
    this.camera.position.z = 40;

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.className = styles.labelRenderer;
    this.mount.appendChild(this.labelRenderer.domElement);

    this.earthSphere = createEarth();
    this.scene.add(this.earthSphere);
    this.scene.background = createSkyBox();
    addLights(this.scene);
    addCountryBorders(this.earthSphere, countriesData);

    this.loadGeoJsonData(countriesData);
  };

  addListeners = () => {
    window.addEventListener("resize", this.handleWindowResize);
  };

  addCountryLabels = (feature) => {
    if (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    ) {
      try {
        if (
          !feature.geometry.coordinates ||
          feature.geometry.coordinates.length === 0
        ) {
          console.warn("Pusta geometria dla kraju: ", feature.properties.name);
          return;
        }
        const centroid = turf.centroid(feature);

        const [longitude, latitude] = centroid.geometry.coordinates;
        if (typeof longitude !== "number" || typeof latitude !== "number") {
          console.warn(
            "Nieprawidłowe współrzędne dla kraju:",
            feature.properties.name
          );
          return;
        }

        const radius = 10;
        const phi = (90 - latitude) * (Math.PI / 180);
        const theta = (longitude + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const countryLabelDiv = document.createElement("div");
        countryLabelDiv.className = styles.countryLabel;
        countryLabelDiv.textContent = feature.properties.name;

        const countryLabel = new CSS2DObject(countryLabelDiv);
        countryLabel.position.set(x, y, z);

        this.scene.add(countryLabel);

        this.earthSphere.add(countryLabel);
      } catch (error) {}
    } else {
      console.warn(
        "Pomijanie kraju o nieobsługiwanym typie geometrii:",
        feature.properties.name,
        feature.geometry.type
      );
    }
  };

  

  handleWindowResize = () => {
    const { innerWidth, innerHeight } = window;
    this.renderer.setSize(innerWidth, innerHeight);
    this.labelRenderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  };

  startAnimation = () => {
    requestAnimationFrame(this.startAnimation);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);

    this.earthSphere.children.forEach((child) => {
      if (child instanceof CSS2DObject) {
        const labelDiv = child.element;
        const labelPosition = child.position.clone();
        const globeCenter = new THREE.Vector3(0, 0, 0);

        const labelVector = labelPosition.clone().sub(globeCenter).normalize();
        const cameraVector = this.camera.position
          .clone()
          .sub(globeCenter)
          .normalize();

        const dotProduct = labelVector.dot(cameraVector);

        if (dotProduct > 0) {
          const screenPosition = labelPosition.project(this.camera);

          if (
            screenPosition.x < -0.1 ||
            screenPosition.x > 0.1 ||
            screenPosition.y < -0.2 ||
            screenPosition.y > 0.2
          ) {
            labelDiv.style.display = "none";
          } else {
            labelDiv.style.display = "block";
          }
        } else {
          labelDiv.style.display = "none";
        }
      }
    });
  };

  //Granice
  loadGeoJsonData = (geoJsonData) => {
    geoJsonData.features.forEach((feature) => {
      this.addCountryLabels(feature);
    });
  };

  // Funkcja do sprawdzenia, czy użytkownik jest zalogowany
  isLoggedIn = () => {
    const token = localStorage.getItem("token"); // Sprawdzamy, czy istnieje token w localStorage
    return token != null; // Jeśli token istnieje, użytkownik jest zalogowany
  };

  // Funkcja dodająca do ulubionych
  toggleFavorite = (league) => {
    console.log('Wywołano toggleFavorite dla ligi:', league);
    if (!this.isLoggedIn()) {
      // Jeśli użytkownik nie jest zalogowany, pokazujemy komunikat
      console.log('Nie jesteś zalogowany');
      this.setState({ showLoginPrompt: true });
      return;
    }
  
    this.setState((prevState) => {
      const isFavorite = prevState.favorites.some(
        (fav) => fav.name === league.name
      );
  
      const updatedFavorites = isFavorite
        ? prevState.favorites.filter((fav) => fav.name !== league.name)
        : [...prevState.favorites, league];
  
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  
      return { favorites: updatedFavorites };
    });
  };

  // Funkcja do zamknięcia komunikatu o logowaniu
  closeLoginPrompt = () => {
    this.setState({ showLoginPrompt: false });
  };
  



  //Selekcja meczy
  handleLeagueClick = (league) => {
    this.props.navigate("/Upcoming", { state: { league } });
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
                    <li
                      key={league.name}
                      onClick={() => this.handleLeagueClick(league)}
                    >
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
                      onClick={(event) => {
                        event.stopPropagation();  // Zatrzymuje propagację, aby kliknięcie nie wpłynęło na inne elementy
                        if (!this.isLoggedIn()) {
                          console.log('Użytkownik nie jest zalogowany');
                          this.setState({ showLoginPrompt: true });  // Pokazuje komunikat o konieczności logowania
                        } else {
                          console.log('Użytkownik zalogowany');
                          this.toggleFavorite(league); // Jeśli użytkownik jest zalogowany, dodajemy do ulubionych
                        }
                      }}
                        style={{
                          marginleft: "105%",
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

          {this.state.showLoginPrompt && (
            <div className={styles.loginPrompt}>
              <p>You need to be logged in to add favorites.</p>
              <button onClick={this.closeLoginPrompt}>Close</button>
            </div>
          )}


          <div className={styles.Favorites}>
            <h2>Favorites</h2>
            <ul>
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <li
                    key={fav.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => this.handleLeagueClick(fav)}
                  >
                    <img
                      src={fav.logo}
                      alt={`${fav.name} logo`}
                      style={{
                        borderRadius: "5px",
                        width: "30px",
                        height: "30px",
                        marginRight: "8px",
                      }}
                    />
                    {fav.name}
                    <FaStar
                      onClick={(event) => {
                        event.stopPropagation();
                        this.toggleFavorite(fav);
                      }}
                      style={{
                        marginLeft: "8px",
                        cursor: "pointer",
                        color: "gold",
                      }}
                    />
                  </li>
                ))
              ) : (
                <p>No favorites added</p>
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

export default (props) => <Globus {...props} navigate={useNavigate()} />;
