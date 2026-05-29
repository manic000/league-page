<script>
    import LinearProgress from '@smui/linear-progress';

    let { managers = [], rosters = [], players = {} } = $props();

    // UI State
    let selectedTeamA = $state('');
    let selectedTeamB = $state('');
    
    // Trade Selections (Arrays of Sleeper IDs)
    let checkedA = $state([]);
    let checkedB = $state([]);

    // API & Result State
    let isEvaluating = $state(false);
    let evalResult = $state(null);
    let evalError = $state(null);
    let isModified = $state(false);

    // Track modifications to re-enable the button
    $effect(() => {
        // Just referencing these variables registers them as dependencies for the effect
        const a = checkedA;
        const b = checkedB;
        const ta = selectedTeamA;
        const tb = selectedTeamB;
        
        if (evalResult || evalError) {
            isModified = true;
        }
    });

    // Helper to extract a structured roster list for a selected roster ID
    const getRosterList = (rosterId) => {
        if (!rosterId) return [];
        const roster = rosters.find(r => String(r.roster_id) === String(rosterId));
        if (!roster || !roster.players) return [];

        let rosterPlayers = roster.players.map(sleeperId => {
            const pInfo = players[sleeperId];
            return {
                id: sleeperId,
                name: pInfo ? `${pInfo.fn} ${pInfo.ln}` : 'Unknown Player',
                position: pInfo ? pInfo.pos : 'UNK',
                team: pInfo ? pInfo.t : ''
            };
        });

        // Generate standard draft picks for the team since Sleeper pick parsing is complex
        const currentYear = new Date().getFullYear();
        const picks = [];
        for (let y = currentYear; y <= currentYear + 2; y++) {
            for (let r = 1; r <= 4; r++) {
                picks.push({
                    id: `pick-${y}-${r}-${rosterId}`,
                    name: `${y} Round ${r} Pick`,
                    position: 'PICK',
                    team: ''
                });
            }
        }

        return [...rosterPlayers, ...picks];
    };

    const rosterListA = $derived(getRosterList(selectedTeamA));
    const rosterListB = $derived(getRosterList(selectedTeamB));

    const handleCheckboxA = (e, id) => {
        if (e.target.checked) checkedA = [...checkedA, id];
        else checkedA = checkedA.filter(i => i !== id);
    };

    const handleCheckboxB = (e, id) => {
        if (e.target.checked) checkedB = [...checkedB, id];
        else checkedB = checkedB.filter(i => i !== id);
    };

    const evaluateTrade = async () => {
        if (checkedA.length === 0 && checkedB.length === 0) return;
        
        isEvaluating = true;
        evalError = null;
        isModified = false;
        
        try {
            const res = await fetch('/api/ra_trade_calc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sideA: checkedA, sideB: checkedB })
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to evaluate trade');
            evalResult = data;
            
        } catch (err) {
            evalError = err.message;
        } finally {
            isEvaluating = false;
        }
    };
</script>

<style>
    .wrapper { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
    h2 { margin: 0 0 6px; }
    .meta { color: var(--g999); font-size: 0.9em; margin-bottom: 24px; }
    .meta a { color: #51a2ff; text-decoration: none; }
    
    .calc-container { background: var(--f3f3f3); padding: 24px; border-radius: 10px; }
    .sides { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 700px) { .sides { grid-template-columns: 1fr; } }
    
    .side { background: var(--fff); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;}
    .side h4 { margin: 0 0 14px; font-size: 1.1em; }
    
    select {
        width: 100%; padding: 10px; border: 1px solid var(--ccc); border-radius: 6px;
        font-size: 1em; margin-bottom: 16px; background: var(--fff);
    }
    
    .scroll-list {
        max-height: 400px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px;
        padding: 8px; flex-grow: 1; background: #fafafa;
    }
    .roster-item {
        display: flex; align-items: center; gap: 10px; padding: 8px;
        border-bottom: 1px solid #eee; cursor: pointer;
    }
    .roster-item:hover { background: #f0f0f0; }
    .roster-item input { cursor: pointer; width: 16px; height: 16px; }
    .item-meta { font-size: 0.85em; color: var(--g555); }
    .pick-pill { background: #e8eef7; color: #51a2ff; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; font-weight: 600;}

    .action-row { text-align: center; margin: 20px 0; }
    .eval-btn {
        background: #51a2ff; color: white; border: none; padding: 12px 30px;
        font-size: 1.1em; font-weight: bold; border-radius: 6px; cursor: pointer;
        transition: background 0.2s;
    }
    .eval-btn:hover:not(:disabled) { background: #2b7fff; }
    .eval-btn:disabled { background: #ccc; cursor: not-allowed; }

    .results-panel { background: var(--fff); border-radius: 8px; padding: 20px; border: 2px solid #51a2ff; }
    .results-panel h3 { margin-top: 0; color: #333; }
    .error { color: #d32f2f; background: #f8d7da; padding: 12px; border-radius: 6px; }
    
    /* Fallback display for dynamic JSON formatting */
    pre.json-dump { background: #222; color: #0f0; padding: 14px; border-radius: 6px; overflow-x: auto; font-size: 0.9em; }
</style>

<div class="wrapper">
    <h2>RosterAudit Trade Calculator</h2>
    <p class="meta">
        Select two teams from the league to view their rosters and build a trade.<br/>
        Values powered by the <a href="https://rosteraudit.com" target="_blank">RosterAudit API</a>.
    </p>

    <div class="calc-container">
        <div class="sides">
            <div class="side">
                <h4>Side A</h4>
                <select bind:value={selectedTeamA} onchange={() => checkedA = []}>
                    <option value="" disabled>Select Team...</option>
                    {#each managers as m}
                        <option value={m.roster}>Team {m.name}</option>
                    {/each}
                </select>

                <div class="scroll-list">
                    {#if rosterListA.length === 0}
                        <div style="padding: 10px; color: #888;">Select a team to view roster</div>
                    {:else}
                        {#each rosterListA as p}
                            <label class="roster-item">
                                <input 
                                    type="checkbox" 
                                    checked={checkedA.includes(p.id)}
                                    onchange={(e) => handleCheckboxA(e, p.id)} 
                                />
                                <span>
                                    {p.name}
                                    {#if p.position === 'PICK'}
                                        <span class="pick-pill">PICK</span>
                                    {:else}
                                        <span class="item-meta">({p.position} {p.team ? `- ${p.team}` : ''})</span>
                                    {/if}
                                </span>
                            </label>
                        {/each}
                    {/if}
                </div>
            </div>

            <div class="side">
                <h4>Side B</h4>
                <select bind:value={selectedTeamB} onchange={() => checkedB = []}>
                    <option value="" disabled>Select Team...</option>
                    {#each managers as m}
                        <option value={m.roster}>Team {m.name}</option>
                    {/each}
                </select>

                <div class="scroll-list">
                    {#if rosterListB.length === 0}
                        <div style="padding: 10px; color: #888;">Select a team to view roster</div>
                    {:else}
                        {#each rosterListB as p}
                            <label class="roster-item">
                                <input 
                                    type="checkbox" 
                                    checked={checkedB.includes(p.id)}
                                    onchange={(e) => handleCheckboxB(e, p.id)} 
                                />
                                <span>
                                    {p.name}
                                    {#if p.position === 'PICK'}
                                        <span class="pick-pill">PICK</span>
                                    {:else}
                                        <span class="item-meta">({p.position} {p.team ? `- ${p.team}` : ''})</span>
                                    {/if}
                                </span>
                            </label>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

        <div class="action-row">
            {#if isEvaluating}
                <LinearProgress indeterminate />
                <p>Evaluating trade with RosterAudit...</p>
            {:else}
                <button 
                    class="eval-btn" 
                    onclick={evaluateTrade} 
                    disabled={(!isModified && evalResult) || (checkedA.length === 0 && checkedB.length === 0)}
                >
                    {(evalResult && isModified) ? 'Evaluate Updated Trade' : 'Evaluate Trade'}
                </button>
            {/if}
        </div>

        {#if evalError}
            <div class="error">
                <strong>Error:</strong> {evalError}
            </div>
        {/if}

        {#if evalResult && !evalError}
            <div class="results-panel" style={isModified ? 'opacity: 0.5; transition: opacity 0.3s;' : ''}>
                <h3>RosterAudit Evaluation</h3>
                
                <p style="font-size: 0.9em; margin-bottom: 10px;">
                    {#if isModified}
                        <em>Trade modified. Click evaluate to update results.</em>
                    {:else}
                        Live API Response:
                    {/if}
                </p>
                <pre class="json-dump">{JSON.stringify(evalResult, null, 2)}</pre>
            </div>
        {/if}
    </div>
</div>
