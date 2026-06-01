import { getLeagueRosters, getLeagueTeamManagers, loadPlayers } from '$lib/utils/helper';

export async function load() {
    // Leverage the exact data orchestration used by working pages like Matchups
    const [rostersData, teamManagersData, playersData] = await Promise.all([
        getLeagueRosters(),
        getLeagueTeamManagers(),
        loadPlayers()
    ]);

    return {
        rostersData,
        teamManagersData,
        players: playersData
    };
}