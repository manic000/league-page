import { getLeagueRosters, getLeagueTeamManagers, getPlayers } from '$lib/utils/helper';

export async function load() {
    // Fetch all required league data concurrently
    const [rostersData, managersData, playersData] = await Promise.all([
        getLeagueRosters(),
        getLeagueTeamManagers(),
        getPlayers()
    ]);
    
    return {
        rosters: rostersData.rosters || rostersData,
        managers: managersData.managers || managersData,
        players: playersData
    };
}