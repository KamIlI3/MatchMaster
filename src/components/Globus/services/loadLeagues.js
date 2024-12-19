import { fetchTopLeagues } from "../../api/fetchLeagues";

const loadLeagues = async (setState) => {
  try {
    const leagues = await fetchTopLeagues();
    setState({ leagues });
  } catch (error) {
    setState({ error: "Error fetching leagues" });
  }
};

export default loadLeagues;