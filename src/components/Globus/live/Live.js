import React, { Component } from "react";
import styles from "../../css/Live.module.css";

import { fetchLiveMatches } from "../../api/fetchLiveMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchStats } from "../../api/fetchMatchStatistics";

class Live extends Component {
  state = {
    liveMatches: [], 
    favorites: [],
    selectedMatch: null,
    error: null, 
  };

  componentDidMount() {
    this.loadLiveMatches();
  }

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
                  <img
                    src={selectedMatch.teams.home.logo}
                    alt={`${selectedMatch.teams.home.name} logo`}
                    style={{ width: "30px", marginRight: "10px" }}
                  />
                  {selectedMatch.teams.home.name} vs{" "}
                  <img
                    src={selectedMatch.teams.away.logo}
                    alt={`${selectedMatch.teams.away.name} logo`}
                    style={{ width: "30px", marginLeft: "10px" }}
                  />
                  {selectedMatch.teams.away.name}
                </h3>
                <p>
                  <strong>Score:</strong>{" "}
                  {selectedMatch.goals.home} - {selectedMatch.goals.away}
                </p>
                <p>
                  <strong>Minute:</strong> {selectedMatch.fixture.status.elapsed} minutes
                </p>
                <p>
                  <strong>Stadium:</strong> {selectedMatch.fixture.venue.name},{" "}
                  {selectedMatch.fixture.venue.city}
                </p>
                <p>
                  <strong>Referee:</strong>{" "}
                  {selectedMatch.fixture.referee || "Not Available"}
                </p>
                <h3>Events</h3>
                <ul>
                  {selectedMatch.events && selectedMatch.events.length > 0 ? (
                    selectedMatch.events.map((event, index) => (
                      <li key={index}>
                        <strong>{event.time.elapsed}'</strong> -{" "}
                        <strong>{event.type}</strong>: {event.detail} by{" "}
                        {event.player?.name || "Unknown"} (
                        {event.team?.name || "Unknown team"})
                      </li>
                    ))
                  ) : (
                    <p>No events available</p>
                  )}
                </ul>
                <h3>Statistics</h3>
                {selectedMatch.stats && selectedMatch.stats.length > 0 ? (
                  <div className={styles.statsContainer}>
                    {selectedMatch.stats.map((teamStats, index) => (
                      <div key={index}>
                        <h4>{teamStats.team.name}</h4>
                        <ul>
                          {teamStats.statistics.map((stat, statIndex) => (
                            <li key={statIndex}>
                              <strong>{stat.type}</strong>: {stat.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Statistics not available</p>
                )}
                <button
                  onClick={() => this.setState({ selectedMatch: null })}
                  style={{ marginTop: "20px" }}
                >
                  Back to Live Matches
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
