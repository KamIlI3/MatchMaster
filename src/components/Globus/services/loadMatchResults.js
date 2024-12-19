import { fetchMatchResults } from "../../api/fetchMatchResults";

const loadMatchResults = async (date, leagueId, setState) => {
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

    setState({ matches: matchesWithDetails });
  } catch (error) {
    setState({ error: "Error fetching matches" });
  }
};

export default loadMatchResults;
