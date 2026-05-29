import { getLeagueRosters, loadPlayers, leagueID } from '$lib/utils/helper';

export async function load({ fetch }) {
    // Fetch rosters, players, and live Sleeper user profiles concurrently
    const [rostersData, playersData, usersRes] = await Promise.all([
        getLeagueRosters(),
        loadPlayers(),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/users`)
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];

    return {
        rosters: rostersData.rosters || rostersData,
        users: users, 
        players: playersData
    };
}