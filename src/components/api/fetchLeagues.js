export const fetchTopLeagues = async () => {
  const url = 'https://api-football-v1.p.rapidapi.com/v3/leagues';
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

      const topLeagues = data.response.filter((league) =>
          (league.country.name === 'Spain' && ['La Liga', 'Copa del Rey', 'Super Cup'].includes(league.league.name)) ||
          (league.country.name === 'England' && ['Premier League', 'FA Cup', 'Community Shield'].includes(league.league.name)) ||
          (league.country.name === 'Germany' && ['Bundesliga', 'DFB Pokal', 'DFL Supercup'].includes(league.league.name)) ||
          (league.country.name === 'Italy' && ['Serie A', 'Coppa Italia', 'Supercoppa Italiana'].includes(league.league.name)) ||
          (league.country.name === 'France' && ['Ligue 1', 'Coupe de France', 'Trophée des Champions'].includes(league.league.name)) ||
          (league.country.name === 'Poland' && ['Ekstraklasa', 'Puchar Polski', 'Superpuchar Polski'].includes(league.league.name)) ||
          ['UEFA Champions League', 'UEFA Europa League', 'UEFA Europa Conference League', 'UEFA Super Cup'].includes(league.league.name)
      );

      return topLeagues.map((league) => ({
          id: league.league.id, 
          name: league.league.name,
          logo: league.league.logo,
      }));
  } catch (error) {
      console.error('Error fetching leagues:', error);
      throw new Error('Failed to fetch leagues');
  }
};
