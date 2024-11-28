import React, { Component } from "react";
import styles from "../../css/Leagues.module.css";
import * as THREE from "three";
import { FaStar } from "react-icons/fa";

import { createEarth } from "../helpers/earth";
import { createSkyBox } from "../helpers/skyBox";

import { fetchInternationalCompetitions } from "../../api/fetchInternational"; 
import { fetchInternationalMatches } from "../../api/fetchInternationalMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchIntercontinentalMatchResults } from "../../api/fetchIntercontinentalMatchResults";
import { fetchStats } from "../../api/fetchMatchStatistics";
import { fetchLineups } from "../../api/fetchLineups";
import { fetchMatchEvents } from "../../api/fetchMatchEvents";

class International extends Component {
  state = {
    leagues: [],
    matches: [],
    selectedLeague: null,
    upcomingMatchesDate: new Date().toISOString().split("T")[0], // dla nadchodzących meczów
    pastMatchesDate: new Date().toISOString().split("T")[0], // dla wyników meczów
    selectedMatchDetails: null,
    selectedMatchLineups: null,
    selectedMatchStats: null,
    showLineups: false,
    activeSection: null,
    favorites: [],
    matchEvents: [],
    error: null,
    results: [],
  };

  componentDidMount() {
    this.initScene();
    this.startAnimation();
    this.loadLeagues();
    this.loadMatches(this.state.upcomingMatchesDate); // Ładujemy nadchodzące mecze
    this.loadResults(this.state.pastMatchesDate); // Ładujemy wyniki meczów

    const location = this.props.location;

    if (location?.state?.league) { 
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

  //Ładowanie wyników
  loadResults = async (date, leagueId = null) => {
    try {
      const results = await fetchIntercontinentalMatchResults(date, leagueId);
      this.setState({ results });
    } catch (error) {
      this.setState({ error: "Error fetching past results" });
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

// Funkcja do zmiany daty dla nadchodzących meczów
handleUpcomingMatchesDateChange = async (event) => {
  const upcomingMatchesDate = event.target.value;
  this.setState({ upcomingMatchesDate }, async () => {
    try {
      const matches = await fetchInternationalMatches(upcomingMatchesDate, this.state.selectedLeague?.id);
      this.setState({ matches });
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      this.setState({ matches: [], error: "Failed to fetch upcoming matches" });
    }
  });
};

// Funkcja do zmiany daty dla wyników meczów
handlePastMatchesDateChange = async (event) => {
  const pastMatchesDate = event.target.value;
  this.setState({ pastMatchesDate }, async () => {
    try {
      const results = await fetchIntercontinentalMatchResults(pastMatchesDate, this.state.selectedLeague?.id);
      this.setState({ results });
    } catch (error) {
      console.error("Error fetching past match results:", error);
      this.setState({ results: [], error: "Failed to fetch past match results" });
    }
  });
};

//   // Szczegóły meczy
handleMatchSelect = async (match) => {
  try {
    const matchId = match.fixture.id;

    // Pobieranie szczegółów meczu
    const matchDetails = await fetchMatchDetails(matchId);
    const lineups = await fetchLineups(matchId);
    const stats = await fetchStats(matchId);
    const events = await fetchMatchEvents(matchId);

    this.setState({
      selectedMatchDetails: matchDetails,
      selectedMatchStats: stats,
      selectedMatchLineups: lineups,
      events,
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
      leagues, 
      favorites, 
      error, 
      selectedMatchDetails,
      selectedMatchStats,
      selectedMatchLineups,
      matchEvents, 
     } = this.state;

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
  <div className={styles.matchesContainer}>
    <div className={styles.upcomingMatches}>
      <h3>Upcoming Matches</h3>
      <label>
        Select Date for Upcoming Matches:
        <input
          type="date"
          value={this.state.upcomingMatchesDate}
          onChange={this.handleUpcomingMatchesDateChange}
        />
      </label>
      {this.state.matches.length > 0 ? (
        <ul>
          {this.state.matches.map((match) => (
            <li key={match.fixture.id} onClick={() => this.handleMatchSelect(match)}>
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
          ))}
        </ul>
      ) : (
        <p>No upcoming matches available for this date.</p>
      )}
    </div>

    <div className={styles.pastResults}>
  <h3>Past Results</h3>
  <label>
    Select Date for Past Results:
    <input
      type="date"
      value={this.state.pastMatchesDate}
      onChange={this.handlePastMatchesDateChange}
    />
  </label>
  {this.state.results.length > 0 ? (
    <ul>
      {this.state.results.map((result) => (
        <li
          key={result.fixture.id}
          onClick={() => this.handleMatchSelect(result)}
        >
          <img
            src={result.teams.home.logo}
            alt={`${result.teams.home.name} logo`}
            style={{
              width: "20px",
              height: "20px",
              marginRight: "5px",
            }}
          />
          <strong>{result.teams.home.name}</strong> vs{" "}
          <img
            src={result.teams.away.logo}
            alt={`${result.teams.away.name} logo`}
            style={{
              width: "20px",
              height: "20px",
              marginLeft: "5px",
            }}
          />
          <strong>{result.teams.away.name}</strong>
          <p>{result.result}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p>No results available for this date.</p>
  )}
</div>
  </div>
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
