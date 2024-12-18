export const fetchInternationalMatches = async (date, leagueId = null) => {
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${date}`;
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
        const countryName = match.league.country;
        const leagueName = match.league.name;
  
        const isInValidCompetitions =
          validCompetitions[countryName] &&
          validCompetitions[countryName].includes(leagueName);
  
        return (
          ((isInValidCompetitions) &&
            (!leagueId || match.league.id === leagueId))
        );
      });
  
      return filteredMatches; 
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw new Error('Failed to fetch matches');
    }
  };
  