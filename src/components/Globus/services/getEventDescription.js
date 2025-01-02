// W pliku, w którym zdefiniowana jest funkcja, np. services.js
const getEventDescription = (event) => {
  const eventTypes = {
    Goal: `Goal (${event.assist ? event.assist.name : "N/A"})`,
    subst: "Substitution",
    Card: event.detail ? event.detail : "Card",
    owngoal: "Own Goal",
    penalty: "Penalty",
  };

  const getEventClass = (event) => {
    if (event.type === "Card") {
      if (event.detail === "Yellow Card") {
        return "yellow-card"; // Żółta kartka
      } else if (event.detail === "Red Card") {
        return "red-card"; // Czerwona kartka
      }
    } else if (event.type === "Goal") {
      return "goal"; // Bramka
    } else if (event.type === "subst") {
      return "substitution"; // Zmiana
    } else if (event.type === "owngoal") {
      return "own-goal"; // Bramka samobójcza
    } else if (event.type === "penalty") {
      return "penalty"; // Rzut karny
    }

    return ""; // Domyślna klasa (jeśli nie pasuje)
  };

  return {
    description: eventTypes[event.type] || "Unknown Event", // Opis wydarzenia
    className: getEventClass(event), // Klasa CSS
  };
};

export default getEventDescription; // Upewnij się, że funkcja jest eksportowana
