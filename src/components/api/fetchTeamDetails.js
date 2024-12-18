export const fetchTeamDetails = async (teamId, leagueId) => {
    const url = `https://api-football-v1.p.rapidapi.com/v3/teams/statistics?league=${leagueId}&season=2020&team=${teamId}`;
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
      return data.response;
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw new Error('Failed to fetch team details');
    }
  };
  