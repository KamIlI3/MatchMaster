import React, { Component } from "react";
import styles from "../../css/Upcoming.module.css";
import { FaStar } from "react-icons/fa";

import { fetchMatches } from "../../api/fetchMatches";
import { fetchMatchDetails } from "../../api/fetchMatchDetails";
import { fetchTeamDetails } from "../../api/fetchTeamDetails";

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
    console.log('Wywołano toggleFavorite dla ligi:', league);
    if (!this.isLoggedIn()) {
      // Jeśli użytkownik nie jest zalogowany, pokazujemy komunikat
      console.log('Nie jesteś zalogowany');
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
                      onClick={() => this.handleLeagueClick(league)}
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
                          event.stopPropagation();  // Zatrzymuje propagację, aby kliknięcie nie wpłynęło na inne elementy
                          if (!this.isLoggedIn()) {
                            console.log('Użytkownik nie jest zalogowany');
                            this.setState({ showLoginPrompt: true });  // Pokazuje komunikat o konieczności logowania
                          } else {
                            console.log('Użytkownik zalogowany');
                            this.toggleFavorite(league); // Jeśli użytkownik jest zalogowany, dodajemy do ulubionych
                          }
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
            ) : this.state.selectedMatchDetails ? (
              <div>
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
                  {" "}
                  {this.state.selectedMatchDetails.teams.home.name}{" "}
                </strong>{" "}
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

export default (props) => <Upcoming {...props} location={useLocation()} />;
