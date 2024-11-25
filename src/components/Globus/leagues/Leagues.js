import React, { Component } from "react";
import styles from "../../css/Leagues.module.css";
import * as THREE from "three";
import { FaStar } from "react-icons/fa";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchTopLeagues } from "../../api/fetchLeagues";
import { fetchMatches } from "../../api/fetchMatches";

class Leagues extends Component {
  state = {
    leagues: [], 
    matches: [], 
    selectedLeague: null, 
    selectedDate: new Date().toISOString().split("T")[0], 
    favorites: [],
    error: null, 
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLeagues();
    this.loadMatches(this.state.selectedDate); 
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

  loadMatches = async (date, leagueId = null) => {
    try {
      const matches = await fetchMatches(date, leagueId); 
      this.setState({ matches });
    } catch (error) {
      this.setState({ error: "Error fetching matches" });
    }
  };

  handleLeagueSelect = async (league) => {
    console.log("Selected league:", league); 
    this.setState({ selectedLeague: league }, async () => {
        try {
            const matches = await fetchMatches(this.state.selectedDate, league.id);
            console.log("Fetched matches:", matches); 
            this.setState({ matches });
        } catch (error) {
            console.error('Error fetching matches for selected league:', error);
            this.setState({ matches: [], error: 'Failed to fetch matches' });
        }
    });
};

  handleDateChange = async (event) => {
    const selectedDate = event.target.value;
    this.setState({ selectedDate }, async () => {
      try {
        const matches = await fetchMatches(
          this.state.selectedDate,
          this.state.selectedLeague?.id 
        );
        this.setState({ matches });
      } catch (error) {
        console.error('Error fetching matches for selected date:', error);
        this.setState({ matches: [], error: 'Failed to fetch matches' });
      }
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
                    <li
                      key={league.id}
                      onClick={() => this.handleLeagueSelect(league)} 
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
                        onClick={(e) => {
                          e.stopPropagation(); 
                          this.toggleFavorite(league);
                        }}
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

          <div className={styles.matchesWrapper}>
            <h2>Matches</h2>
            {this.state.selectedLeague && (
              <div>
                <h3>{this.state.selectedLeague.name}</h3>
              </div>
            )}
            <label>
              Select Date:
              <input
                type="date"
                value={this.state.selectedDate}
                onChange={this.handleDateChange}
              />
            </label>
            <ul>
              {this.state.matches.length > 0 ? (
                this.state.matches.map((match) => (
                  <li key={match.fixture.id}>
                    <img
                      src={match.teams.home.logo}
                      alt={`${match.teams.home.name} logo`}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "5px",
                      }}
                    />
                    <strong>{match.teams.home.name}</strong> vs{" "}
                    <img
                      src={match.teams.away.logo}
                      alt={`${match.teams.away.name} logo`}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginLeft: "5px",
                      }}
                    />
                    <strong>{match.teams.away.name}</strong>
                    <p>{new Date(match.fixture.date).toLocaleString()}</p>
                  </li>
                ))
              ) : (
                <p>No matches available for this date.</p>
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
