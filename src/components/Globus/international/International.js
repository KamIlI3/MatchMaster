import React, { Component } from "react";
import styles from "../../css/Leagues.module.css";
import * as THREE from "three";
import { FaStar } from "react-icons/fa";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchInternationalCompetitions } from "../../api/fetchInternational"; 
import { fetchInternationalMatches } from "../../api/fetchInternationalMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";


class International extends Component {
  state = {
    leagues: [],
    matches: [],
    selectedLeague: null,
    selectedDate: new Date().toISOString().split("T")[0],
    selectedMatchDetails: null,
    selectedMatchLineups: null,
    showLineups: false,
    favorites: [],
    error: null,
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLeagues();
    this.loadMatches(this.state.selectedDate);

    const location = this.props.location;

    if (location?.state?.league) { // Bezpieczna nawigacja
        this.handleLeagueSelect(location.state.league);
    }
  }

  // Scena
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

  // Ligi
  loadLeagues = async () => {
    try {
      const leagues = await fetchInternationalCompetitions();
      this.setState({ leagues });
    } catch (error) {
      this.setState({ error: "Error fetching leagues" });
    }
  };

  
  // Dodawnie do ulubionych
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

  // Api meczów
  loadMatches = async (date, leagueId = null) => {
    try {
      const matches = await fetchInternationalMatches(date, leagueId);
      this.setState({ matches });
    } catch (error) {
      this.setState({ error: "Error fetching matches" });
    }
  };

  //Selekcja meczy
  handleLeagueSelect = async (league) => {
    this.setState({ selectedLeague: league }, async () => {
      try {
        const matches = await fetchInternationalMatches(this.state.selectedDate, league.id);
        this.setState({ matches });
      } catch (error) {
        console.error("Error fetching matches for selected league:", error);
        this.setState({ matches: [], error: "Failed to fetch matches" });
      }
    });
  };

//   // Selekcja poprzez date
  handleDateChange = async (event) => {
    const selectedDate = event.target.value;
    this.setState({ selectedDate }, async () => {
      try {
        const matches = await fetchInternationalMatches(
          this.state.selectedDate,
          this.state.selectedLeague?.id
        );
        this.setState({ matches });
      } catch (error) {
        console.error("Error fetching matches for selected date:", error);
        this.setState({ matches: [], error: "Failed to fetch matches" });
      }
    });
  };

//   // Szczegóły meczy
  handleMatchSelect = async (match) => {
    try {
      const matchDetails = await fetchMatchDetails(match.fixture.id);
      this.setState({ selectedMatchDetails: matchDetails });
    } catch (error) {
      console.error("Error fetching match details:", error);
      this.setState({ error: "Failed to fetch match details" });
    }
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
            <h2>
              {this.state.selectedMatchDetails ? "Match Details" : "Matches"}
            </h2>
            {this.state.selectedMatchDetails ? (
              <div>
                <h3>
                  {this.state.selectedMatchDetails.teams.home.name} vs{" "}
                  {this.state.selectedMatchDetails.teams.away.name}
                </h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    this.state.selectedMatchDetails.fixture.date
                  ).toLocaleString()}
                </p>
                <p>
                  <strong>Stadium:</strong>{" "}
                  {this.state.selectedMatchDetails.fixture.venue.name}
                </p>
                <p>
                  <strong>City:</strong>{" "}
                  {this.state.selectedMatchDetails.fixture.venue.city}
                </p>
                <p>
                  <strong>Referee:</strong>{" "}
                  {this.state.selectedMatchDetails.fixture.referee ||
                    "Not Available"}
                </p>
                <button
                  onClick={() => this.setState({ selectedMatchDetails: null })}
                >
                  Back to Matches
                </button>
              </div>
            ) : (
              <>
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
                      <li
                        key={match.fixture.id}
                        onClick={() => this.handleMatchSelect(match)}
                      >
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
              </>
            )}
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

export default International;
