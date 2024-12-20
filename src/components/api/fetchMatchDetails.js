export const fetchMatchDetails = async (fixtureId) => {
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${fixtureId}`;
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
      return data.response[0]; 
    } catch (error) {
      console.error('Error fetching match details:', error);
      throw new Error('Failed to fetch match details');
    }
  };
  