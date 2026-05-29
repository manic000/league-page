import { getLeagueRosters, loadPlayers, managers } from '$lib/utils/helper';

export async function load() {
    // Fetch rosters and players concurrently
    const [rostersData, playersData] = await Promise.all([
        getLeagueRosters(),
        loadPlayers()
    ]);
    
    return {
        rosters: rostersData.rosters || rostersData,
        managers: managers, // We pull this directly from your pre-configured leagueInfo array
        players: playersData
    };
}