<script>
    import RATradeCalculator from '$lib/PlayerPickValues/RATradeCalculator.svelte';
    let { data } = $props();
</script>

<svelte:head>
    <title>RA Trade Calculator</title>
</svelte:head>

<RATradeCalculator 
    teamManagersData={data.teamManagersData} 
    rostersData={data.rostersData} 
    players={data.players} 
/>