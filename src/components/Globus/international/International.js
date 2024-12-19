import React, { Component } from "react";
import styles from "../../css/International.module.css";

import { fetchInternationalCompetitions } from "../../api/fetchInternational"; 
import { fetchInternationalMatches } from "../../api/fetchInternationalMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchIntercontinentalMatchResults } from "../../api/fetchIntercontinentalMatchResults";
import { fetchStats } from "../../api/fetchMatchStatistics";
import { fetchMatchEvents } from "../../api/fetchMatchEvents";
import { fetchTeamDetails } from "../../api/fetchTeamDetails";

class International extends Component {
  state = {
    leagues: [],
    matches: [],
    selectedLeague: null,
    upcomingMatchesDate: new Date().toISOString().split("T")[0],
    pastMatchesDate: new Date().toISOString().split("T")[0],
    selectedMatchDetails: null,
    selectedMatchStats: null,
    selectedTeamDetails: null,
    activeSection: null,
    favorites: [],
    matchEvents: [],
    error: null,
    results: [],
    isLoading: false, // Flaga ładowania
  };

  componentDidMount() {
    this.loadLeagues();
    this.loadMatches(this.state.upcomingMatchesDate);
    this.loadResults(this.state.pastMatchesDate);

    const location = this.props.location;

    if (location?.state?.league) { 
        this.handleLeagueSelect(location.state.league);
    }
  }



  loadLeagues = async () => {
    this.setState({ isLoading: true, error: null });
    try {
      const leagues = await fetchInternationalCompetitions();
      this.setState({ leagues });
    } catch (error) {
      this.setState({ error: "Error fetching leagues" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  loadMatches = async (date, leagueId = null) => {
    this.setState({ isLoading: true, error: null });
    try {
      const matches = await fetchInternationalMatches(date, leagueId);
      this.setState({ matches });
    } catch (error) {
      this.setState({ error: "Error fetching matches" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  loadResults = async (date, leagueId = null) => {
    this.setState({ isLoading: true, error: null });
    try {
      const matches = await fetchIntercontinentalMatchResults(date, leagueId);

      const matchesWithDetails = matches.map((match) => {
        const homeScore = match.goals?.home ?? "N/A";
        const awayScore = match.goals?.away ?? "N/A";

        return {
          ...match,
          result: `${homeScore} - ${awayScore}`,
        };
      });

      this.setState({ results: matchesWithDetails });
    } catch (error) {
      this.setState({ error: "Error fetching match results" });
    } finally {
      this.setState({ isLoading: false });
    }
  };


  handleUpcomingMatchesDateChange = (event) => {
    const upcomingMatchesDate = event.target.value;
    this.setState({ upcomingMatchesDate });
    this.loadMatches(upcomingMatchesDate, this.state.selectedLeague?.id);
  };

  handlePastMatchesDateChange = (event) => {
    const pastMatchesDate = event.target.value;
    this.setState({ pastMatchesDate });
    this.loadResults(pastMatchesDate, this.state.selectedLeague?.id);
  };

  handleMatchSelect = async (match) => {
    this.setState({ isLoading: true, error: null });
    try {
      const matchDetails = await fetchMatchDetails(match.fixture.id);
      const matchStats = await fetchStats(match.fixture.id);
      const matchEvents = await fetchMatchEvents(match.fixture.id);
  
  
      this.setState({
        selectedMatchDetails: matchDetails,
        selectedMatchStats: matchStats,
        matchEvents,
      });
    } catch (error) {
      this.setState({ error: "Failed to fetch match details or statistics" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  toggleStats = () => {
    this.setState((prevState) => ({
      activeSection: prevState.activeSection === "stats" ? null : "stats",
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

  // Szczegóły drużyn
    handleFetchTeamDetails = async (teamId, leagueId) => {
      try {
        const { teamDetails, teamStatistics } = await fetchTeamDetails(
          teamId,
          leagueId
        );
        this.setState(
            {
                selectedTeamDetails: teamDetails,
                teamStatistics,
            }
        );
      } catch (error) {
        console.error("Error in handleFetchTeamDetails:", error);
      }
    };

  render() {
    const { 
      matches, 
      results, 
      selectedMatchDetails, 
      selectedMatchStats, 
      matchEvents, 
      upcomingMatchesDate, 
      pastMatchesDate, 
      isLoading, 
      error 
    } = this.state;
  
    return (
      <div className={styles.globusContainer}>
        <div className={styles.contentWrapper}>
        <h2>
              {this.state.selectedTeamDetails
                ? "Team Details"
                : this.state.selectedMatchDetails
                ? "Match Details"
                : "Matches"}
            </h2>

            {/* Sprawdzanie, czy mamy dane drużyny w stanie */}
            {this.state.selectedTeamDetails ? (
              <div>
                <h3>{this.state.selectedTeamDetails.name}</h3>
                <img
                  src={this.state.selectedTeamDetails.logo}
                  alt={this.state.selectedTeamDetails.name}
                />

                <div>
                  <h4>Form:</h4>
                  <p>{this.state.teamStatistics.form}</p>

                  <h4>Fixtures:</h4>
                  <p>
                    Home Matches Played:{" "}
                    {this.state.teamStatistics.fixtures.played.home}
                  </p>
                  <p>
                    Away Matches Played:{" "}
                    {this.state.teamStatistics.fixtures.played.away}
                  </p>
                  <p>
                    Total Matches Played:{" "}
                    {this.state.teamStatistics.fixtures.played.total}
                  </p>

                  <h4>Goals</h4>
                  <p>
                    Goals Scored:{" "}
                    {this.state.teamStatistics.goalsFor.total.total}
                  </p>
                  <p>
                    Goals Conceded:{" "}
                    {this.state.teamStatistics.goalsAgainst.total.total}
                  </p>
                  <p>
                    Average Goals Scored:{" "}
                    {this.state.teamStatistics.goalsFor.average.total}
                  </p>
                  <p>
                    Average Goals Conceded:{" "}
                    {this.state.teamStatistics.goalsAgainst.average.total}
                  </p>

                  <h4>Biggest Streak</h4>
                  <p>Wins: {this.state.teamStatistics.biggest.streak.wins}</p>
                  <p>Draws: {this.state.teamStatistics.biggest.streak.draws}</p>
                  <p>
                    Losses: {this.state.teamStatistics.biggest.streak.loses}
                  </p>

                  <h4>Clean Sheets</h4>
                  <p>Total: {this.state.teamStatistics.cleanSheet.total}</p>

                  <h4>Failed to Score</h4>
                  <p>Total: {this.state.teamStatistics.failedToScore.total}</p>

                  <h4>Penalties</h4>
                  <p>
                    Scored: {this.state.teamStatistics.penalty.scored.total}
                  </p>
                  <p>
                    Missed: {this.state.teamStatistics.penalty.missed.total}
                  </p>

                  <h4>Lineups</h4>
                  {this.state.teamStatistics.lineups.map((lineup, index) => (
                    <div key={index}>
                      <p>Formation: {lineup.formation}</p>
                      <p>Matches Played: {lineup.played}</p>
                    </div>
                  ))}

                  <h4>Cards</h4>
                  <h5>Yellow Cards</h5>
                  {Object.entries(this.state.teamStatistics.cards.yellow).map(
                    ([timeRange, stats]) => (
                      <div key={timeRange}>
                        <p>
                          {timeRange}: {stats.total} ({stats.percentage})
                        </p>
                      </div>
                    )
                  )}
                  <h5>Red Cards</h5>
                  {Object.entries(this.state.teamStatistics.cards.red).map(
                    ([timeRange, stats]) => (
                      <div key={timeRange}>
                        <p>
                          {timeRange}: {stats.total} ({stats.percentage})
                        </p>
                      </div>
                    )
                  )}

                  <button
                    onClick={() =>
                      this.setState({ selectedTeamDetails: null })
                    }
                  >
                    Back to Matches
                  </button>
                </div>
              </div>
            ) : selectedMatchDetails ? (
            <div className={styles.matchesWrapper}>
              <h2>Match Details</h2>
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

                  onClick={() => {
                    const teamId =
                      this.state.selectedMatchDetails?.teams?.home?.id;
                    const leagueId =
                      this.state.selectedMatchDetails?.league?.id;
                    if (teamId && leagueId) {
                      this.handleFetchTeamDetails(teamId, leagueId);
                    }
                  }}
                />
                <strong 
                onClick={() => {
                  const teamId =
                    this.state.selectedMatchDetails?.teams?.home?.id;
                  const leagueId =
                    this.state.selectedMatchDetails?.league?.id;
                  if (teamId && leagueId) {
                    this.handleFetchTeamDetails(teamId, leagueId);
                  }
                }}
                >
                  {selectedMatchDetails.teams.home.name} </strong>vs{" "}
                <img
                  src={selectedMatchDetails.teams.away.logo}
                  alt={`${selectedMatchDetails.teams.away.name} logo`}
                  style={{ width: "30px", height: "30px", marginLeft: "8px" }}

                  onClick={() => {
                    const teamId =
                      this.state.selectedMatchDetails?.teams?.away?.id;
                    const leagueId =
                      this.state.selectedMatchDetails?.league?.id;
                    if (teamId && leagueId) {
                      this.handleFetchTeamDetails(teamId, leagueId);
                    }
                  }}
                />
                <strong
                 onClick={() => {
                  const teamId =
                    this.state.selectedMatchDetails?.teams?.away?.id;
                  const leagueId =
                    this.state.selectedMatchDetails?.league?.id;
                  if (teamId && leagueId) {
                    this.handleFetchTeamDetails(teamId, leagueId);
                  }
                }}
                >
                  {selectedMatchDetails.teams.away.name}</strong>
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
  
              <button
                onClick={() =>
                  this.setState({
                    selectedMatchDetails: null,
                    selectedMatchStats: null,
                    activeSection: null,
                  })
                }
              >
                Back to Matches
              </button>
            </div>
          ) : (
            <div className={styles.matchesWrapper}>
              {/* Sekcja nadchodzących meczów */}
              <div className={styles.upcomingMatches}>
                <h2>Upcoming Matches</h2>
                <input
                  type="date"
                  value={upcomingMatchesDate}
                  onChange={this.handleUpcomingMatchesDateChange}
                />
                {isLoading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <ul>
                    {matches.map((match) => (
                      <li
                        key={match.fixture.id}
                        onClick={() => this.handleMatchSelect(match)}
                        style={{ cursor: "pointer" }}
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
                    ))}
                  </ul>
                )}
              </div>
  
              {/* Sekcja wyników zakończonych meczów */}
              <div className={styles.pastMatches}>
                <h2>Past Match Results</h2>
                <input
                  type="date"
                  value={pastMatchesDate}
                  onChange={this.handlePastMatchesDateChange}
                />
                {isLoading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <ul>
                    {results.map((match) => (
                      <li key={match.fixture.id}
                      onClick={() => this.handleMatchSelect(match)}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={match.leagueLogo}
                            alt={`${match.leagueName} logo`}
                            style={{ width: "20px", height: "20px", marginRight: "5px" }}
                          />
                          <strong>{match.leagueName}</strong>
                        </div>
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
                        <p>Result: {match.result}</p>
                        <p>{new Date(match.fixture.date).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <div
            className={styles.globeWrapper}
            ref={(ref) => (this.mount = ref)}
          />
      </div>
    );
  }
  
}

export default International;
