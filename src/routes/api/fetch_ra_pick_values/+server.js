import { json } from '@sveltejs/kit';

const RA_URL = 'https://rosteraudit.com/wp-json/ra/v1/rankings/values?format_key=1qb_half';
const TWELVE_HOURS = 60 * 60 * 12;

export async function GET({ fetch }) {
    try {
        // Fetch both RosterAudit values and your existing player info concurrently
        const [raRes, playersRes] = await Promise.all([
            fetch(RA_URL),
            fetch('/api/fetch_players_info')
        ]);

        if (!raRes.ok) return json({ error: `RosterAudit responded ${raRes.status}` }, { status: 502 });
        if (!playersRes.ok) return json({ error: `Players API responded ${playersRes.status}` }, { status: 502 });

        const raData = await raRes.json();
        const playersData = await playersRes.json();

        // RosterAudit arrays or objects need to be standardized
        let rawValues = Array.isArray(raData) ? raData : Object.entries(raData).map(([id, value]) => ({ id, value }));

        const players = rawValues.map((row) => {
            const playerId = String(row.id || row.player_id);
            const p = playersData[playerId] || {}; // Hydrate with sleeper data
            
            // Handle draft picks if RosterAudit formats them specially
            const isPick = playerId.toLowerCase().includes('pick') || p.position === 'PICK' || p.position === 'RDP';
            const position = isPick ? 'PICK' : (p.position ?? '').toUpperCase();
            
            return {
                id: playerId,
                sleeperId: p.sleeper_id ?? playerId,
                name: p.full_name ?? p.name ?? row.name ?? `Unknown (${playerId})`,
                position: position,
                team: p.team ?? '',
                age: p.age ?? null,
                value: typeof row.value === 'number' ? row.value : parseFloat(row.value) || 0,
            };
        }).filter(p => p.value > 0); // Keep only assets with positive value

        return json(
            { players, fetchedAt: Date.now() },
            {
                headers: {
                    'cache-control': `public, s-maxage=${TWELVE_HOURS}, stale-while-revalidate=3600`,
                },
            }
        );
    } catch (err) {
        return json({ error: `Failed to process RosterAudit data: ${err.message}` }, { status: 500 });
    }
}