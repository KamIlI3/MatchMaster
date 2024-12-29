import React, { Component } from "react";
import styles from "../../css/Upcoming.module.css";
import { FaStar } from "react-icons/fa";

import { fetchMatches } from "../../api/fetchMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchTeamDetails } from "../../api/fetchTeamDetails";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReplyAll } from "@fortawesome/free-solid-svg-icons";

import loadLeagues from "../services/loadLeagues";

import { useLocation } from "react-router-dom";

class Upcoming extends Component {
  state = {
    leagues: [],
    matches: [],
    selectedLeague: null,
    selectedDate: new Date().toISOString().split("T")[0],
    selectedMatchDetails: null,
    selectedTeamDetails: null,
    favorites: [],
    error: null,
    showLoginPrompt: false,
  };

  componentDidMount() {
    loadLeagues(this.setState.bind(this));
    this.loadMatches(this.state.selectedDate);

    const location = this.props.location;
    const league = location.state?.league;

    if (league) {
      this.handleLeagueSelect(league);
    }

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    this.setState({ favorites: storedFavorites });
  }

  // Funkcja do sprawdzenia, czy użytkownik jest zalogowany
  isLoggedIn = () => {
    const token = localStorage.getItem("token"); // Sprawdzamy, czy istnieje token w localStorage
    return token != null; // Jeśli token istnieje, użytkownik jest zalogowany
  };

  // Funkcja dodająca do ulubionych
  toggleFavorite = (league) => {
    console.log("Wywołano toggleFavorite dla ligi:", league);
    if (!this.isLoggedIn()) {
      // Jeśli użytkownik nie jest zalogowany, pokazujemy komunikat
      console.log("Nie jesteś zalogowany");
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

  // Api meczów
  loadMatches = async (date, leagueId = null) => {
    try {
      const matches = await fetchMatches(date, leagueId);
      this.setState({ matches });
    } catch (error) {
      this.setState({ error: "Error fetching matches" });
    }
  };

  //Selekcja meczy
  handleLeagueSelect = async (league) => {
    this.setState({ selectedLeague: league }, async () => {
      try {
        const matches = await fetchMatches(this.state.selectedDate, league.id);
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
        const matches = await fetchMatches(
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

  // Szczegóły meczów
  handleMatchSelect = async (match) => {
    try {
      const matchDetails = await fetchMatchDetails(match.fixture.id);
      this.setState({ selectedMatchDetails: matchDetails });
    } catch (error) {
      console.error("Error fetching match details:", error);
      this.setState({ error: "Failed to fetch match details" });
    }
  };

  // Szczegóły drużyn
  handleFetchTeamDetails = async (teamId, leagueId) => {
    try {
      const { teamDetails, teamStatistics } = await fetchTeamDetails(
        teamId,
        leagueId
      );

      this.setState({
        selectedTeamDetails: teamDetails,
        teamStatistics,
      });
    } catch (error) {
      console.error("Error in handleFetchTeamDetails:", error);
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
                        onClick={(event) => {
                          event.stopPropagation(); // Zatrzymuje propagację, aby kliknięcie nie wpłynęło na inne elementy
                          if (!this.isLoggedIn()) {
                            console.log("Użytkownik nie jest zalogowany");
                            this.setState({ showLoginPrompt: true }); // Pokazuje komunikat o konieczności logowania
                          } else {
                            console.log("Użytkownik zalogowany");
                            this.toggleFavorite(league); // Jeśli użytkownik jest zalogowany, dodajemy do ulubionych
                          }
                        }}
                        style={{
                          marginLeft: "8px",
                          cursor: "pointer",
                          color: isFavorite ? "rgb(81, 190, 218)" : "gray",
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
                   <b> {this.state.teamStatistics.form
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
                      })}
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
                  <p><b>Wins: </b>{this.state.teamStatistics.biggest.streak.wins}</p>
                  <p><b>Draws: </b>{this.state.teamStatistics.biggest.streak.draws}</p>
                  <p>
                  <b>Losses:</b> {this.state.teamStatistics.biggest.streak.loses}
                  </p>

                  <h3>Clean Sheets</h3>
                  <p><b>Total:</b> {this.state.teamStatistics.cleanSheet.total}</p>

                  <h3>Failed to Score</h3>
                  <p><b>Total:</b> {this.state.teamStatistics.failedToScore.total}</p>

                  <h3>Penalties</h3>
                  <p>
                  <b>Scored:</b> {this.state.teamStatistics.penalty.scored.total}
                  </p>
                  <p>
                  <b>Missed:</b> {this.state.teamStatistics.penalty.missed.total}
                  </p>

                  <h3>Lineups</h3>
                  {this.state.teamStatistics.lineups.map((lineup, index) => (
                    <div key={index}>
                      <p><b>Formation:</b> {lineup.formation}</p>
                      <p><b>Matches Played:</b> {lineup.played}</p>
                    </div>
                  ))}

                  <h3>Cards</h3>
                  <h4 style={{ color: 'yellow' }}>Yellow Cards</h4>
                  {Object.entries(this.state.teamStatistics.cards.yellow).map(
                    ([timeRange, stats]) => (
                      <div key={timeRange}>
                        <p>
                        <b>{timeRange} min. :</b> {stats.total} ({stats.percentage})
                        </p>
                      </div>
                    )
                  )}
                  <h4 style={{ color: 'red' }}>Red Cards</h4>
                  {Object.entries(this.state.teamStatistics.cards.red).map(
                    ([timeRange, stats]) => (
                      <div key={timeRange}>
                        <p>
                        <b>{timeRange} min. :</b> {stats.total} ({stats.percentage})
                        </p>
                      </div>
                    )
                  )}

                  <button
                    onClick={() => this.setState({ selectedTeamDetails: null })}
                  >
                    <FontAwesomeIcon icon={faReplyAll} />
                    Back to Matches
                  </button>
                </div>
              </div>
            ) : this.state.selectedMatchDetails ? (
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
                vs{" "}
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
                <button
                  onClick={() => this.setState({ selectedMatchDetails: null })}
                >
                  <FontAwesomeIcon icon={faReplyAll} />
                  Back to Matches
                </button>
              </div>
            ) : (
              <>
                {this.state.selectedLeague && (
                  <div>
                    <h3 className={styles.teamName}>
                      {this.state.selectedLeague.name}
                    </h3>
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

export default (props) => <Upcoming {...props} location={useLocation()} />;
