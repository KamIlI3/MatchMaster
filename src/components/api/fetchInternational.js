export const fetchInternationalCompetitions = async () => {
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
  
        // Filtrujemy tylko międzynarodowe rozgrywki reprezentacyjne
        const internationalLeagues = data.response.filter((league) =>
            ['World Cup', 'Euro Championship', 'Confederations Cup', 'FIFA Intercontinental Cup', 'World Cup - Qualification Intercontinental Play-offs',
            'World Cup - Qualification CONCACAF', 'World Cup - Qualification Europe', 'African Nations Championship', 'Africa Cup of Nations', 'Copa America',
            'UEFA Nations League'].includes(league.league.name)
        );
        return internationalLeagues.map((league) => ({
            id: league.league.id, 
            name: league.league.name,
            logo: league.league.logo,
        }));
    } catch (error) {
        console.error('Error fetching international leagues:', error);
        throw new Error('Failed to fetch international leagues');
    }
  };
  