export const fetchLineups = async (matchId) => {
  try {
    const response = await fetch(`https://api.football-data.org/v4/matches/${matchId}/lineups`);
    const data = await response.json();

    return data.lineups || [];
  } catch (error) {
    console.error('Error fetching lineups:', error);
    return [];  
  }
};