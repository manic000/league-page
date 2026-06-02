export const getRaPickValues = async (fetch) => {
    const fetcher = fetch ?? globalThis.fetch;
    const res = await fetcher('/api/fetch_ra_pick_values');
    if (!res.ok) {
        throw new Error(`Failed to load RosterAudit player & pick values (${res.status})`);
    }
    return res.json();
};