export const fetchMatches = async (date) => {
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
  
      const validCompetitions = {
        Spain: ['La Liga', 'Copa del Rey', 'Super Cup'],
        England: ['Premier League', 'FA Cup', 'Community Shield'],
        Germany: ['Bundesliga', 'DFB Pokal', 'DFL Supercup'],
        Italy: ['Serie A', 'Coppa Italia', 'Supercoppa Italiana'],
        France: ['Ligue 1', 'Coupe de France', 'Trophée des Champions'],
        Poland: ['Ekstraklasa', 'Puchar Polski', 'Superpuchar Polski'],
      };
  
      const internationalCompetitions = [
        'Champions League',
        'Europa League',
        'Europa Conference League',
      ];
  
      const filteredMatches = data.response.filter((match) => {
        const countryName = match.league.country;
        const leagueName = match.league.name;
  
        return (
          (validCompetitions[countryName] &&
            validCompetitions[countryName].includes(leagueName)) ||
          internationalCompetitions.includes(leagueName)
        );
      });
  
      console.log("Filtered Matches:", filteredMatches); 
      return filteredMatches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw new Error('Failed to fetch matches');
    }
  };
  