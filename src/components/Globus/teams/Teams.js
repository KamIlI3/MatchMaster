import React, { Component } from "react";
import styles from "../../css/Leagues.module.css";
import * as THREE from "three";
import { FaStar } from "react-icons/fa";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchTopLeagues } from "../../api/fetchLeagues";
import { fetchMatchResults } from "../../api/fetchMatchResults";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchStats } from "../../api/fetchMatchStatistics";
import { fetchLineups } from "../../api/fetchLineups";
import { fetchMatchEvents } from "../../api/fetchMatchEvents";

import { useLocation } from "react-router-dom";

class Leagues extends Component {
  state = {
    leagues: [],
    matches: [],
    selectedLeague: null,
    selectedDate: new Date().toISOString().split("T")[0],
    selectedMatchDetails: null,
    selectedMatchLineups: [],
    selectedMatchStats: null,
    activeSection: null,
    favorites: [],
    error: null,
    matchEvents: [],
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLeagues();
    this.loadMatchResults(this.state.selectedDate);

    const location = this.props.location;
    const league = location.state?.league;

    if (league) {
      this.handleLeagueSelect(league);
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
      const leagues = await fetchTopLeagues();
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

  // Api wyników
  loadMatchResults = async (date, leagueId = null) => {
    try {
      const matches = await fetchMatchResults(date, leagueId);

      const matchesWithDetails = matches.map((match) => {
        const homeScore = match.goals.home;
        const awayScore = match.goals.away;

        return {
          ...match,
          result: `${homeScore} - ${awayScore}`,
        };
      });

      this.setState({ matches: matchesWithDetails });
    } catch (error) {
      this.setState({ error: "Error fetching matches" });
    }
  };

  //Selekcja meczy
  handleLeagueSelect = async (league) => {
    this.setState({ selectedLeague: league }, async () => {
      try {
        const matches = await fetchMatchResults(
          this.state.selectedDate,
          league.id
        );
        this.setState({ matches });
      } catch (error) {
        console.error("Error fetching matches for selected league:", error);
        this.setState({ matches: [], error: "Failed to fetch matches" });
      }
    });
  };

  // Selekcja poprzez date
  handleDateChange = async (event) => {
    const selectedDate = event.target.value;
    this.setState({ selectedDate }, async () => {
      try {
        const matches = await fetchMatchResults(
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

  // Szczegóły meczy
  handleMatchSelect = async (match) => {
    try {
      const matchDetails = await fetchMatchDetails(match.fixture.id);
      const matchStats = await fetchStats(match.fixture.id);
      const matchLineups = await fetchLineups(match.fixture.id);

      const matchEvents = await fetchMatchEvents(match.fixture.id);


      this.setState({
        selectedMatchDetails: matchDetails,
        selectedMatchStats: matchStats,
        selectedMatchLineups: matchLineups,
        matchEvents,
        showStats: false,
        showLineups: false,
      });
    } catch (error) {
      this.setState({ error: "Failed to fetch match details or statistics" });
    }
  };

  toggleStats = () => {
    this.setState((prevState) => ({
      activeSection: prevState.activeSection === "stats" ? null : "stats",
    }));
  };

  toggleLineups = () => {
    this.setState((prevState) => ({
      activeSection: prevState.activeSection === "lineups" ? null : "lineups",
    }));
  };

  getEventDescription(event) {
    const eventTypes = {
      Goal: `Goal (Assisted by ${event.assist ? event.assist.name : "N/A"})`,
      subst: "Substitution",
      Card: event.detail ? event.detail : "Card",
      owngoal: "Own Goal",
      penalty: "Penalty",
    };

    if (event.type === "Card" && event.detail === "Yellow Card") {
      return "Yellow Card";
    } else if (event.type === "Card" && event.detail === "Red Card") {
      return "Red Card";
    }

    return eventTypes[event.type] || "Unknown Event";
  }

  render() {
    const {
      selectedMatchDetails,
      selectedMatchStats,
      selectedMatchLineups,
      matchEvents,
      error,
    } = this.state;

    return (
      <div className={styles.globusContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.leaguesList}>
            {error && <p>{error}</p>}
            <h2>Leagues</h2>
            <ul>
              {this.state.leagues.length > 0 ? (
                this.state.leagues.map((league) => {
                  const isFavorite = this.state.favorites.some(
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
            <h2>{selectedMatchDetails ? "Match Details" : "Matches"}</h2>
            {selectedMatchDetails ? (

              <div>
                {/* Wyświetlenie szczegółów meczu */}
                <h3>
                  <img
                    src={selectedMatchDetails.teams.home.logo}
                    alt={`${selectedMatchDetails.teams.home.name} logo`}
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "8px",
                    }}
                  />
                  {selectedMatchDetails.teams.home.name} vs{" "}
                  <img
                    src={selectedMatchDetails.teams.away.logo}
                    alt={`${selectedMatchDetails.teams.away.name} logo`}
                    style={{ width: "30px", height: "30px", marginLeft: "8px" }}
                  />
                  {selectedMatchDetails.teams.away.name}
                </h3>
                <p>
                  <strong>Result:</strong> {selectedMatchDetails.goals.home} -{" "}
                  {selectedMatchDetails.goals.away}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedMatchDetails.fixture.date).toLocaleString()}
                </p>
                <p>
                  <strong>Stadium:</strong>{" "}
                  {selectedMatchDetails.fixture.venue.name}
                </p>
                <p>
                  <strong>City:</strong>{" "}
                  {selectedMatchDetails.fixture.venue.city}
                </p>
                <p>
                  <strong>Referee:</strong>{" "}
                  {selectedMatchDetails.fixture.referee || "Not Available"}
                </p>

                {/* Przycisk do wyświetlania statystyk */}
                <button onClick={this.toggleStats}>
                  {this.state.activeSection === "stats"
                    ? "Hide Stats"
                    : "Show Stats"}
                </button>

                {/* Przycisk do wyświetlania składów */}
                <button onClick={this.toggleLineups}>
                  {this.state.activeSection === "lineups"
                    ? "Hide Lineups"
                    : "Show Lineups"}
                </button>

                {/* Wyświetlanie wydarzeń meczu */}
                <div>
                  <h4>Match Events:</h4>
                  <ul>
                    {matchEvents.length > 0 ? (
                      matchEvents.map((event, index) => (
                        <li key={index}>
                          <strong>{event.player.name}</strong> (
                          {event.team.name}) - {this.getEventDescription(event)}{" "}
                          at {event.time.elapsed}'
                        </li>
                      ))
                    ) : (
                      <p>No events available for this match.</p>
                    )}
                  </ul>
                </div>

                {/* Jeśli showStats jest true, wyświetlamy statystyki */}
                {this.state.activeSection === "stats" &&
                selectedMatchStats &&
                selectedMatchStats.length > 0 ? (
                  <div>
                    <h4>Match Statistics:</h4>
                    <ul>
                      {selectedMatchStats.map((stat, index) => (
                        <li key={index}>
                          <strong>{stat.team.name}:</strong>
                          <ul>
                            {stat.statistics.map((statItem, idx) => (
                              <li key={idx}>
                                <strong>{statItem.type}:</strong>{" "}
                                {statItem.value}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  this.state.activeSection === "stats" && (
                    <p>No statistics available for this match.</p>
                  )
                )}

                {this.state.activeSection === "lineups" &&
                selectedMatchLineups &&
                selectedMatchLineups.length > 0 ? (
                  <div>
                    <h4>Lineups:</h4>
                    <div>
                      {selectedMatchLineups.map((lineup, index) => (
                        <div key={index}>
                          <h5>{lineup.team.name}</h5>
                          <ul>
                            {lineup.players.map((player, idx) => (
                              <li key={idx}>{player.player.name}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  this.state.activeSection === "lineups" && (
                    <p>No lineups available for this match.</p>
                  )
                )}

                <button
                  onClick={() =>
                    this.setState({
                      selectedMatchDetails: null,
                      selectedMatchStats: null,
                    })
                  }
                >
                  Back to Matches
                </button>

                {/* Wyświetlenie szczegółów meczu */}
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
                        <p>
                          <strong>Result:</strong> {match.result}
                        </p>
                        <p>
                          <strong>Status: Finished</strong>
                        </p>
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

export default (props) => <Leagues {...props} location={useLocation()} />;
