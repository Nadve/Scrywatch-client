<script>
    export let card;
    export let finish;
</script>

{#if (card.finishes.includes(finish))}
    {#if (card.finish === finish)}
        <input type=radio
            name={card.id}
            on:input={() => card.finish = finish}
            checked>
    {:else}
        <input type=radio
            name={card.id}
            on:input={() => card.finish = finish}>
    {/if}
{:else}
    <input type=radio disabled>
{/if}