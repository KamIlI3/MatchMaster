// fetchLiveMatches.js

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
  
      // Filtrowanie meczów na podstawie ligi i kraju
      const filteredMatches = data.response.filter((match) => {
        const { country, name } = match.league;
  
        return (
          (country.name === 'Spain' && ['La Liga', 'Copa del Rey', 'Super Cup'].includes(name)) ||
          (country.name === 'England' && ['Premier League', 'FA Cup', 'Community Shield'].includes(name)) ||
          (country.name === 'Germany' && ['Bundesliga', 'DFB Pokal', 'DFL Supercup'].includes(name)) ||
          (country.name === 'Italy' && ['Serie A', 'Coppa Italia', 'Supercoppa Italiana'].includes(name)) ||
          (country.name === 'France' && ['Ligue 1', 'Coupe de France', 'Trophée des Champions'].includes(name)) ||
          (country.name === 'Poland' && ['Ekstraklasa', 'Puchar Polski', 'Superpuchar Polski'].includes(name)) ||
          ['Champions League', 'Europa League', 'Europa Conference League'].includes(name)
        );
      });
  
      return filteredMatches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw new Error('Failed to fetch live matches');
    }
  };
  