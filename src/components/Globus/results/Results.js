import React, { Component } from "react";
import styles from "../../css/Upcoming.module.css";
import { FaStar } from "react-icons/fa";

import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchStats } from "../../api/fetchMatchStatistics";
import { fetchMatchEvents } from "../../api/fetchMatchEvents";
import { fetchTeamDetails } from "../../api/fetchTeamDetails";

import loadLeagues from "../services/loadLeagues";
import loadMatchResults from "../services/loadMatchResults";
import getEventDescription from "../services/getEventDescription";


import { useLocation } from "react-router-dom";

class Results extends Component {
  state = {
    leagues: [],
    matches: [],
    selectedLeague: null,
    selectedDate: new Date().toISOString().split("T")[0],
    selectedMatchDetails: null,
    selectedMatchStats: null,
    selectedTeamDetails: null,
    activeSection: null,
    favorites: [],
    error: null,
    matchEvents: [],
  };

  componentDidMount() {
    loadLeagues(this.setState.bind(this));
    loadMatchResults(this.state.selectedDate, null, this.setState.bind(this));

    const location = this.props.location;
    const league = location.state?.league;

    if (league) {
      this.handleLeagueSelect(league);
    }
  }

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


  //Selekcja meczy
  handleDateChange = async (event) => {
    const selectedDate = event.target.value;
    this.setState({ selectedDate }, async () => {
      loadMatchResults(
        this.state.selectedDate,
        this.state.selectedLeague?.id,
        this.setState.bind(this)
      );
    });
  };
  
  handleLeagueSelect = async (league) => {
    this.setState({ selectedLeague: league }, async () => {
      loadMatchResults(
        this.state.selectedDate,
        league.id,
        this.setState.bind(this)
      );
    });
  };

  // Szczegóły meczy
  handleMatchSelect = async (match) => {
    try {
      const matchDetails = await fetchMatchDetails(match.fixture.id);
      const matchStats = await fetchStats(match.fixture.id);

      const matchEvents = await fetchMatchEvents(match.fixture.id);


      this.setState({
        selectedMatchDetails: matchDetails,
        selectedMatchStats: matchStats,
        matchEvents,
        showStats: false,
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
      selectedMatchDetails,
      selectedMatchStats,
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
                          {event.team.name}) - {getEventDescription(event)}{" "}
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

export default (props) => <Results {...props} location={useLocation()} />;
