import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
    try {
        const { sideA, sideB } = await request.json();

        // Check if API key is configured
        if (!env.ROSTER_AUDIT_API_KEY) {
            return json({ error: "RosterAudit API Key is not configured on the server." }, { status: 500 });
        }

        // RosterAudit Evaluation Endpoint
        // Note: We format the payload based on standard RA developer guidelines. 
        const response = await fetch('https://rosteraudit.com/wp-json/ra/v1/trade/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.ROSTER_AUDIT_API_KEY}`,
                'User-Agent': 'BoneCrusher-Fantasy-App/1.0'
            },
            body: JSON.stringify({
                format: '1qb',
                team1: sideA, // Array of sleeper IDs
                team2: sideB  // Array of sleeper IDs
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`RosterAudit API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return json(data);

    } catch (err) {
        console.error("Trade Calc Proxy Error:", err);
        return json({ error: err.message }, { status: 502 });
    }
}