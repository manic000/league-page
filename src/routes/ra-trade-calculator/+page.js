import { getLeagueRosters, loadPlayers } from '$lib/utils/helper';
import { leagueID } from '$lib/utils/leagueInfo';

export async function load({ fetch }) {
    // Fetch rosters, players, and live Sleeper user profiles concurrently
    const [rostersData, playersData, usersRes] = await Promise.all([
        getLeagueRosters(),
        loadPlayers(),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/users`)
    ]);

    const usersData = usersRes.ok ? await usersRes.json() : [];
    
    // Defensively ensure users is an array so it never crashes the UI
    const users = Array.isArray(usersData) ? usersData : [];

    return {
        rosters: rostersData.rosters || rostersData,
        users: users, 
        players: playersData
    };
}