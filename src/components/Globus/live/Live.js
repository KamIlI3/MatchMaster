import React, { Component } from "react";
import styles from "../../css/Live.module.css";
import * as THREE from "three";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchLiveMatches } from "../../api/fetchLiveMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchStats } from "../../api/fetchMatchStatistics";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReplyAll } from "@fortawesome/free-solid-svg-icons";

class Live extends Component {
  state = {
    liveMatches: [],
    favorites: [],
    selectedMatch: null,
    error: null,
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLiveMatches();
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

  // live mecze
  loadLiveMatches = async () => {
    try {
      const liveMatches = await fetchLiveMatches();
      this.setState({ liveMatches });
    } catch (error) {
      console.error("Error loading live matches:", error);
      this.setState({ error: "Error fetching live matches" });
    }
  };

  handleMatchSelect = async (fixtureId) => {
    try {
      // Pobierz szczegóły meczu
      const selectedMatch = await fetchMatchDetails(fixtureId);
      // Pobierz statystyki meczu
      const stats = await fetchStats(fixtureId);

      this.setState({
        selectedMatch: { ...selectedMatch, stats },
      });
    } catch (error) {
      console.error("Error fetching match details or statistics:", error);
    }
  };

  render() {
    const { liveMatches, error, selectedMatch } = this.state;

    return (
      <div className={styles.globusContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.liveMatches}>
            <h2>Live Matches</h2>
            {selectedMatch ? (
              <div className={styles.matchDetails}>
                <h3>
                  <strong>{selectedMatch.teams.home.name}</strong>
                  <img
                    src={selectedMatch.teams.home.logo}
                    alt={`${selectedMatch.teams.home.name} logo`}
                    style={{ width: "30px", marginRight: "10px" }}
                  />
                  {selectedMatch.goals.home} - {selectedMatch.goals.away}
                  <img
                    src={selectedMatch.teams.away.logo}
                    alt={`${selectedMatch.teams.away.name} logo`}
                    style={{ width: "30px", marginLeft: "10px" }}
                  />
                  <strong>{selectedMatch.teams.away.name}</strong>
                </h3>
                <p>
                  <strong>
                    Minute:{" "}
                    <b style={{ color: "red" }}>
                      {selectedMatch.fixture.status.elapsed}`
                    </b>
                  </strong>
                </p>
                <p>
                  <b>Stadium:</b> {selectedMatch.fixture.venue.name},{" "}
                  {selectedMatch.fixture.venue.city}
                </p>
                <p>
                  <b>Referee:</b>{" "}
                  {selectedMatch.fixture.referee || "Not Available"}
                </p>
                <h3>Events</h3>
                <div className={styles.matchEvents}>
                  <ul className={styles.eventsUl}>
                    <h4>{selectedMatch.teams.home.name}</h4>
                    {selectedMatch.events && selectedMatch.events.length > 0 ? (
                      selectedMatch.events
                        .filter(
                          (event) =>
                            event.team?.id === selectedMatch.teams.home.id
                        )
                        .map((event, index) => (
                          <li key={`home-${index}`}>
                            <strong>{event.time.elapsed}'</strong> -{" "}
                            <strong>
                              <u>{event.detail}</u>
                            </strong>{" "}
                            - {event.player?.name || "Unknown"}
                          </li>
                        ))
                    ) : (
                      <p>No events for home team</p>
                    )}
                  </ul>

                  <ul className={styles.eventsUl}>
                    <h4>{selectedMatch.teams.away.name}</h4>
                    {selectedMatch.events && selectedMatch.events.length > 0 ? (
                      selectedMatch.events
                        .filter(
                          (event) =>
                            event.team?.id === selectedMatch.teams.away.id
                        )
                        .map((event, index) => (
                          <li key={`away-${index}`}>
                            <strong>{event.time.elapsed}'</strong> -{" "}
                            <strong>
                              <u>{event.detail}</u>
                            </strong>{" "}
                            - {event.player?.name || "Unknown"}
                          </li>
                        ))
                    ) : (
                      <p>No events for away team</p>
                    )}
                  </ul>
                </div>
                <h3>Statistics</h3>
                {selectedMatch.stats && selectedMatch.stats.length > 0 ? (
                  <div className={styles.statsContainer}>
                    {selectedMatch.stats.map((teamStats, index) => (
                      <ul key={index} className={styles.stats}>
                        {teamStats.statistics.map((stat, statIndex) => (
                          <li key={statIndex}>
                            <strong>{stat.type}</strong>: {stat.value}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                ) : (
                  <p>Statistics not available</p>
                )}
                <button
                  onClick={() => this.setState({ selectedMatch: null })}
                  style={{ marginTop: "20px" }}
                >
                  <FontAwesomeIcon icon={faReplyAll} />
                  Back to Matches
                </button>
              </div>
            ) : (
              <>
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
                        onClick={() => this.handleMatchSelect(match.fixture.id)}
                      >
                          <img
                            src={match.league.logo}
                            alt={`${match.league.name} logo`}
                            style={{
                              width: "35px",
                              height: "35px",
                            }}
                          />
                          <div className={styles.currentMatch}>
                        <strong>{match.teams.home.name}</strong>
                        <img
                          src={match.teams.home.logo}
                          alt={`${match.teams.home.name} logo`}
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "5px",
                          }}
                        />
                        {match.fixture.status.elapsed || 0}' <br></br>
                        vs
                        <img
                          src={match.teams.away.logo}
                          alt={`${match.teams.away.name} logo`}
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "5px",
                          }}
                        />
                        <strong>{match.teams.away.name}</strong>
                        </div>
                          {match.league.name}
                      </li>
                    ))
                  ) : (
                    <p>No live matches available</p>
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

export default Live;
