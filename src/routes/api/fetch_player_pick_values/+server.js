import { json } from '@sveltejs/kit';

const RA_BASE = 'https://rosteraudit.com/wp-json/ra/v1';

// 12h CDN cache: upstream is hit at most twice per day.
// A vercel.json cron pings this endpoint at 06:00 and 18:00 UTC to keep the cache warm.
const TWELVE_HOURS = 60 * 60 * 12;

export async function GET() {
    try {
        const pagePromises = [];
        
        // Fetch top 500 players (5 pages of 100) from RosterAudit
        // Using 1qb format for this league's specific context.
        for (let i = 1; i <= 5; i++) {
            pagePromises.push(
                fetch(`${RA_BASE}/rankings?format=1qb&per_page=100&page=${i}`)
                    .then(r => r.ok ? r.json() : [])
                    .catch(() => [])
            );
        }
        
        // Fetch all draft pick values concurrently
        pagePromises.push(
            fetch(`${RA_BASE}/picks?format=1qb`)
                .then(r => r.ok ? r.json() : [])
                .catch(() => [])
        );

        const results = await Promise.all(pagePromises);
        const picksRaw = results.pop();
        
        // Safely extract arrays in case the API response is wrapped in an object like { data: [...] }
        let playersList = [];
        for (const raw of results) {
            const items = Array.isArray(raw) ? raw : (raw?.data || raw?.items || []);
            playersList = playersList.concat(items);
        }
        const picksList = Array.isArray(picksRaw) ? picksRaw : (picksRaw?.data || picksRaw?.items || []);

        const playerMap = new Map();

        // 1. Parse and standardize Players
        for (const row of playersList) {
            const p = row.player || row;
            if (!p) continue;
            
            // Value parsing: fallback chain to safely support RosterAudit's variable payload formats
            const value = Number(row.value ?? row.value_1qb ?? p.value ?? p.value_1qb ?? 0);
            if (!value) continue;

            const name = p.full_name ?? p.name ?? '';
            const sleeperId = String(p.sleeper_id ?? p.sleeperId ?? p.id ?? '');
            const id = String(p.id ?? p.player_id ?? sleeperId ?? name);
            if (!id || !name) continue;

            playerMap.set(id, {
                id,
                sleeperId,
                name,
                position: String(p.position ?? '').toUpperCase(),
                team: p.team ?? p.maybeTeam ?? '',
                age: p.age ?? p.maybeAge ?? null,
                value,
                overallRank: row.rank ?? row.overallRank ?? null,
                positionRank: row.position_rank ?? row.positionRank ?? null,
            });
        }

        // 2. Parse and standardize Picks
        for (const row of picksList) {
            const pick = row.pick || row;
            if (!pick) continue;

            const value = Number(row.value ?? row.value_1qb ?? pick.value ?? pick.value_1qb ?? 0);
            if (!value) continue;

            const season = pick.season || row.season || '';
            const round = pick.round || row.round || '';
            const slot = pick.slot || row.slot || '';
            
            let name = pick.name || row.name || '';
            if (!name && season && round) {
                // Generate a formatted name if RosterAudit just provided metadata
                const roundStr = round == 1 ? '1st' : round == 2 ? '2nd' : round == 3 ? '3rd' : round == 4 ? '4th' : `${round}th`;
                const slotStr = slot ? String(slot).charAt(0).toUpperCase() + String(slot).slice(1) + ' ' : '';
                name = `${season} ${slotStr}${roundStr}`;
            }

            const id = String(pick.id ?? name);
            if (!playerMap.has(id)) {
                playerMap.set(id, {
                    id,
                    sleeperId: null, // Picks don't use sleeper IDs for thumbnails
                    name,
                    position: 'PICK',
                    team: '',
                    age: null,
                    value,
                    overallRank: null,
                    positionRank: null,
                });
            }
        }

        const players = Array.from(playerMap.values()).sort((a, b) => b.value - a.value);

        return json(
            { players, fetchedAt: Date.now() },
            {
                headers: {
                    'cache-control': `public, s-maxage=${TWELVE_HOURS}, stale-while-revalidate=3600`,
                },
            }
        );
    } catch (err) {
        return json({ error: `Failed to reach RosterAudit API: ${err.message}` }, { status: 502 });
    }
}
