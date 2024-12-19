const getEventDescription = (event) => {
  const eventTypes = {
    Goal: `Goal (Assisted by ${event.assist ? event.assist.name : "N/A"})`,
    subst: "Substitution",
    Card: event.detail ? event.detail : "Card",
    owngoal: "Own Goal",
    penalty: "Penalty",
  };

  if (event.type === "Card" && event.detail === "Yellow Card") {
    return "Yellow Card";
  } else if (event.type === "Card" && event.detail === "Red Card") {
    return "Red Card";
  }

  return eventTypes[event.type] || "Unknown Event";
};

export default getEventDescription;
