export const fetchIntercontinentalMatchResults = async (date, leagueId = null) => {
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${date}&status=FT`; 
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'aa3e27b7f2msh5c8003078a944f9p1f07e6jsn35e6c0a6fdd6',
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    const validCompetitions = [
      'World Cup', 
      'Euro Championship', 
      'Confederations Cup', 
      'World Cup - Qualification Intercontinental Play-offs',
      'World Cup - Qualification CONCACAF', 
      'World Cup - Qualification Europe', 
      'African Nations Championship', 
      'Africa Cup of Nations', 
      'Copa America',
      'UEFA Nations League',
    ];

    const filteredMatches = data.response.filter((match) => {
      const leagueName = match.league.name;
      return (
        validCompetitions.includes(leagueName) &&
        (!leagueId || match.league.id === leagueId)
      );
    });

    const matchesWithResults = filteredMatches.map((match) => {
      const homeScore = match.goals.home ?? "N/A";
      const awayScore = match.goals.away ?? "N/A";

      return {
        ...match,
        result: `${homeScore} - ${awayScore}`,
        leagueName: match.league.name,
        leagueLogo: match.league.logo,
      };
    });

    return matchesWithResults;
  } catch (error) {
    console.error('Error fetching match results:', error);
    throw new Error('Failed to fetch match results');
  }
};
