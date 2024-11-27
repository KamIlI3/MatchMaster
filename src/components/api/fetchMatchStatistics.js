export const fetchStats = async (fixtureId) => {
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics?fixture=${fixtureId}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'aa3e27b7f2msh5c8003078a944f9p1f07e6jsn35e6c0a6fdd6',
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.response;  
  } catch (error) {
    console.error('Error fetching match statistics:', error);
    throw error;
  }
};