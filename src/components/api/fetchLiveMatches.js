export const fetchLiveMatches = async () => {
  const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all';
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

    // Filtruj mecze na podstawie podanych lig i krajów
    const filteredMatches = data.response.filter((match) => {
      const leagueName = match.league.name;
      const countryName = match.league.country;

      return (
        (countryName === 'Spain' && ['La Liga', 'Copa del Rey', 'Super Cup'].includes(leagueName)) ||
        (countryName === 'England' && ['Premier League', 'FA Cup', 'Community Shield'].includes(leagueName)) ||
        (countryName === 'Germany' && ['Bundesliga', 'DFB Pokal', 'DFL Supercup'].includes(leagueName)) ||
        (countryName === 'Italy' && ['Serie A', 'Coppa Italia', 'Supercoppa Italiana'].includes(leagueName)) ||
        (countryName === 'France' && ['Ligue 1', 'Coupe de France', 'Trophée des Champions'].includes(leagueName)) ||
        (countryName === 'Poland' && ['Ekstraklasa', 'Puchar Polski', 'Superpuchar Polski'].includes(leagueName)) ||
        ['UEFA Champions League', 'UEFA Europa League', 'UEFA Europa Conference League', 'UEFA Super Cup'].includes(leagueName)
      );
    });

    return filteredMatches;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw new Error('Failed to fetch live matches');
  }
};
