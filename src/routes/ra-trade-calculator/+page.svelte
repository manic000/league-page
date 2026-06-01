<script>
    import RATradeCalculator from '$lib/PlayerPickValues/RATradeCalculator.svelte';
    let { data } = $props();
</script>

<svelte:head>
    <title>RA Trade Calculator</title>
</svelte:head>

<RATradeCalculator 
    users={data.users} 
    rosters={data.rosters} 
    players={data.players} 
/>