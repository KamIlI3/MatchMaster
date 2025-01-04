import React, { Component } from "react";
import styles from "../../css/International.module.css";

import { fetchInternationalCompetitions } from "../../api/fetchInternational"; 
import { fetchInternationalMatches } from "../../api/fetchInternationalMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchIntercontinentalMatchResults } from "../../api/fetchIntercontinentalMatchResults";
import { fetchStats } from "../../api/fetchMatchStatistics";
import { fetchMatchEvents } from "../../api/fetchMatchEvents";
import { fetchTeamDetails } from "../../api/fetchTeamDetails";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReplyAll } from "@fortawesome/free-solid-svg-icons";
import getEventDescription from "../services/getEventDescription";

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
    isLoading: false, 
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
        {this.state.showLoginPrompt && (
            <div className={styles.loginPrompt}>
              <p>You need to be logged in to add favorites.</p>
              <button onClick={this.closeLoginPrompt}>Close</button>
            </div>
          )}
        <h2>
              {this.state.selectedTeamDetails
                ? "Team Details"
                : this.state.selectedMatchDetails
                ? "Match Details"
                : "Matches"}
            </h2>

            {/* Sprawdzanie, czy mamy dane drużyny w stanie */}
            {this.state.selectedTeamDetails ? (
              this.state.error ? (
                <p style={{ color: "red" }}>{this.state.error}</p>
              ) : (
                <div className={styles.matchesWrapperContent}>
                  <span className={styles.teamNameAndLogo}>
                    <h3 className={styles.teamName}>
                      {this.state.selectedTeamDetails.name}
                    </h3>
                    <img
                      src={this.state.selectedTeamDetails.logo}
                      alt={this.state.selectedTeamDetails.name}
                    />
                  </span>

                  <div>
                    <h3>Form:</h3>
                    <p>
                      <b>
                        {this.state.teamStatistics.form
                          ? this.state.teamStatistics.form
                              .split("")
                              .map((letter, index) => {
                                let color;
                                switch (letter) {
                                  case "W":
                                    color = "green";
                                    break;
                                  case "L":
                                    color = "red";
                                    break;
                                  case "D":
                                    color = "gray";
                                    break;
                                  default:
                                    color = "black"; // Domyślny kolor dla innych znaków
                                }

                                return (
                                  <span
                                    key={index}
                                    style={{ color: color, marginRight: "5px" }}
                                  >
                                    {letter}
                                  </span>
                                );
                              })
                          : "No data available"}
                      </b>
                    </p>

                    <h3>Fixtures:</h3>
                    <p>
                      <b>Total Matches Played:</b>{" "}
                      {this.state.teamStatistics.fixtures.played.total}
                    </p>
                    <p>
                      <b>Home Matches Played:</b>{" "}
                      {this.state.teamStatistics.fixtures.played.home}
                    </p>
                    <p>
                      <b>Away Matches Played:</b>{" "}
                      {this.state.teamStatistics.fixtures.played.away}
                    </p>

                    <h3>Goals</h3>
                    <p>
                      <b>Goals Scored:</b>{" "}
                      {this.state.teamStatistics.goalsFor.total.total}
                    </p>
                    <p>
                      <b>Goals Conceded:</b>{" "}
                      {this.state.teamStatistics.goalsAgainst.total.total}
                    </p>
                    <p>
                      <b>Average Goals Scored:</b>{" "}
                      {this.state.teamStatistics.goalsFor.average.total}
                    </p>
                    <p>
                      <b>Average Goals Conceded:</b>{" "}
                      {this.state.teamStatistics.goalsAgainst.average.total}
                    </p>

                    <h3>Biggest Streak</h3>
                    <p>
                      <b>Wins: </b>
                      {this.state.teamStatistics.biggest.streak.wins}
                    </p>
                    <p>
                      <b>Draws: </b>
                      {this.state.teamStatistics.biggest.streak.draws}
                    </p>
                    <p>
                      <b>Losses:</b>{" "}
                      {this.state.teamStatistics.biggest.streak.loses}
                    </p>

                    <h3>Clean Sheets</h3>
                    <p>
                      <b>Total:</b> {this.state.teamStatistics.cleanSheet.total}
                    </p>

                    <h3>Failed to Score</h3>
                    <p>
                      <b>Total:</b>{" "}
                      {this.state.teamStatistics.failedToScore.total}
                    </p>

                    <h3>Penalties</h3>
                    <p>
                      <b>Scored:</b>{" "}
                      {this.state.teamStatistics.penalty.scored.total}
                    </p>
                    <p>
                      <b>Missed:</b>{" "}
                      {this.state.teamStatistics.penalty.missed.total}
                    </p>

                    <h3>Lineups</h3>
                    {this.state.teamStatistics.lineups.map((lineup, index) => (
                      <div key={index}>
                        <p>
                          <b>Formation:</b> {lineup.formation}
                        </p>
                        <p>
                          <b>Matches Played:</b> {lineup.played}
                        </p>
                      </div>
                    ))}

                    <h3>Cards</h3>
                    <h4 style={{ color: "yellow" }}>Yellow Cards</h4>
                    {Object.entries(this.state.teamStatistics.cards.yellow).map(
                      ([timeRange, stats]) => (
                        <div key={timeRange}>
                          <p>
                            <b>{timeRange} min. :</b> {stats.total} (
                            {stats.percentage})
                          </p>
                        </div>
                      )
                    )}
                    <h4 style={{ color: "red" }}>Red Cards</h4>
                    {Object.entries(this.state.teamStatistics.cards.red).map(
                      ([timeRange, stats]) => (
                        <div key={timeRange}>
                          <p>
                            <b>{timeRange} min. :</b> {stats.total} (
                            {stats.percentage})
                          </p>
                        </div>
                      )
                    )}

                    <button
                      onClick={() =>
                        this.setState({ selectedTeamDetails: null })
                      }
                    >
                      <FontAwesomeIcon icon={faReplyAll} />
                      Back to Matches
                    </button>
                  </div>
                </div>
              )

            ) : selectedMatchDetails ? (
              <div className={styles.matchesWrapperContent}>
              <strong
                className={styles.teamName}
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
                {" "}
                {this.state.selectedMatchDetails.teams.home.name}{" "}
              </strong>
              <img
                src={this.state.selectedMatchDetails?.teams?.home?.logo}
                alt={`${this.state.selectedMatchDetails?.teams?.home?.name} logo`}
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "8px",
                  verticalAlign: "middle",
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
              />{" "}
              <b>{`${this.state.selectedMatchDetails?.goals?.home} - ${this.state.selectedMatchDetails?.goals?.away}`}</b>
              {" "}
              <img
                src={this.state.selectedMatchDetails?.teams?.away?.logo}
                alt={`${this.state.selectedMatchDetails?.teams?.away?.name} logo`}
                style={{
                  width: "30px",
                  height: "30px",
                  marginLeft: "8px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
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
                className={styles.teamName}
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
                {this.state.selectedMatchDetails.teams.away.name}
              </strong>
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
  
              {/* Przycisk do wyświetlania statystyk */}
              <button onClick={this.toggleStats}>
                  {this.state.activeSection === "stats"
                    ? "Hide Stats"
                    : "Show Stats"}
                </button>
  
               {/* Jeśli showStats jest true, wyświetlamy statystyki */}
               {this.state.activeSection === "stats" &&
                  selectedMatchStats &&
                  selectedMatchStats.length > 0 ? (
                    <div className={styles.matchStats}>
                      <span><h4>Match Statistics:</h4></span>
                      <span className={styles.stats}>
                          {selectedMatchStats.map((stat) => (
                              <ul>
                                {stat.statistics.map((statItem, idx) => (
                                  <li key={idx}>
                                    <strong>{statItem.type}:</strong>{" "}
                                    {statItem.value}
                                  </li>
                                ))}
                              </ul>
                          ))}
                        </span>
                    </div>
                  ) : (
                    this.state.activeSection === "stats" && (
                      <p>No statistics available for this match.</p>
                    )
                  )}

                {/* Wyświetlanie wydarzeń meczu */}
                <h4>Match Events:</h4>
                <div className={styles.matchEvents}>
                  <div className={styles.homeMatchEvents}>
                    <ul>
                      {matchEvents.filter(
                        (event) =>
                          event.team.name ===
                          this.state.selectedMatchDetails?.teams?.home?.name
                      ).length > 0 ? (
                        matchEvents
                          .filter(
                            (event) =>
                              event.team.name ===
                              this.state.selectedMatchDetails?.teams?.home?.name
                          )
                          .map((event, index) => {
                            const { description, className } =
                              getEventDescription(event);

                            return (
                              <li key={index} className={styles[className]}>
                                <strong>{event.player.name}</strong> -{" "}
                                {description} at {event.time.elapsed}'
                              </li>
                            );
                          })
                      ) : (
                        <p>No events for the home team.</p>
                      )}
                    </ul>
                  </div>

                  <div className={styles.awayMatchEvents}>
                    <ul>
                      {matchEvents.filter(
                        (event) =>
                          event.team.name ===
                          this.state.selectedMatchDetails?.teams?.away?.name
                      ).length > 0 ? (
                        matchEvents
                          .filter(
                            (event) =>
                              event.team.name ===
                              this.state.selectedMatchDetails?.teams?.away?.name
                          )
                          .map((event, index) => {
                            const { description, className } =
                              getEventDescription(event);

                            return (
                              <li key={index} className={styles[className]}>
                                <strong>{event.player.name}</strong> -{" "}
                                {description} at {event.time.elapsed}'
                              </li>
                            );
                          })
                      ) : (
                        <p>No events for the away team.</p>
                      )}
                    </ul>
                  </div>
                </div>

                <button
                    onClick={() =>
                      this.setState({
                        selectedMatchDetails: null,
                        selectedMatchStats: null,
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faReplyAll} />
                    Back to Matches
                  </button>

                {/* Wyświetlenie szczegółów meczu */}
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
                        <strong>{match.teams.home.name}</strong>
                        <img
                          src={match.teams.home.logo}
                          alt={`${match.teams.home.name} logo`}
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "5px",
                          }}
                        /> {new Date(match.fixture.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
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
                        <p>
                          {match.result} <br></br>
                          {new Date(match.fixture.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>{" "}
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
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={match.leagueLogo}
                            alt={`${match.leagueName} logo`}
                            style={{ width: "30px", height: "30px", marginRight: "5px" }}
                          />
                          <strong>{match.leagueName}</strong>
                        </div>
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
