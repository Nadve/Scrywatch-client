<script>
    import MediaQuery from 'svelte-media-queries';
    import { enhance } from '$app/forms';
    import Chart from '$lib/components/Chart.svelte';
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { buyList, sellList, sellInterestIndex, buyInterestIndex } from '$lib/appState.js';
    import { Intention } from '$lib/types/intention.js';

    let selectedPrintIndex;
    let focusedPrintIndex;

    let noChanges = true;

    let sellSelectedIndex;
    sellInterestIndex.subscribe(value => { sellSelectedIndex = value; });

    let buySelectedIndex;
    buyInterestIndex.subscribe(value => { buySelectedIndex = value; });

    let buyInterest;
    buyList.subscribe(value => { buyInterest = value; });
    let originalBuyList = structuredClone($buyList);

    let sellInterest;
    sellList.subscribe(value => { sellInterest = value; });
    let originalSellList = structuredClone($sellList);

    // If goal changes for any of the cards => noChanges = false
    $: {
        let changes = true;
        if (cardSwitch) {
            interests?.forEach(i => {
                originalSellList.forEach(o => {
                    if (i.id === o.id) {
                        if (i.goal != o.goal) {
                            changes = false;
                        }

                        return;
                    }
                })
            });
        } else {
            interests?.forEach(i => {
                originalBuyList.forEach(o => {
                    if (i.id === o.id) {
                        if (i.goal != o.goal) {
                            changes = false;
                        }

                        return;
                    }
                })
            });
        }
        noChanges = changes;
    }
    
    // If any of the interests is removed => noChanges = false
    $: {
        if (cardSwitch) {
            if (originalSellList.length != interests.length) {
                noChanges = false;
            }
        } else {
            if (originalBuyList.length != interests.length) {
                noChanges = false;
            }
        }
    }

    let cardSwitch = false;
    // if user doesn't have buy interests, switch to sell interests
    if (buyInterest.length === 0)
        cardSwitch = true;

    // intention switch mechanics
    let interests;
    let intention;
    $: if (cardSwitch){
        interests = sellInterest;
        intention = Intention.Sell;
        selectedPrintIndex = sellSelectedIndex;
        focusedPrintIndex = sellSelectedIndex;
    }
    else {
        interests = buyInterest;
        intention = Intention.Buy;
        selectedPrintIndex = buySelectedIndex;
        focusedPrintIndex = buySelectedIndex;
    }

    $: activeInterest = interests[selectedPrintIndex];
    $: cardFront = activeInterest?.card.face.front;

    function interestSelected(index) {
        if (cardSwitch){
            sellInterestIndex.set(index);
        } else {
            buyInterestIndex.set(index);
        }
    }

    function handleDelete() {
        let index = selectedPrintIndex;
        if (index === interests.length - 1) {
            interestSelected(index - 1);
        }
        interests.splice(index, 1);
        interests = interests;
    }

    function handleSubmit() {
        if(cardSwitch) {
            if(interests.length !== originalSellList){
                originalSellList = originalSellList.filter(o =>
                    !deleted.includes(o.id));
            }
            interests?.forEach(i => {
                originalSellList.forEach(o => {
                    if (i.id === o.id) {
                        if (i.goal != o.goal) {
                            o.goal = i.goal;
                        }
                    }
                });
            });
            originalSellList = originalSellList;
        } else {
            if(interests.length !== originalBuyList){
                originalBuyList = originalBuyList.filter(o =>
                    !deleted.includes(o.id));
            } 
            interests?.forEach(i => {
                originalBuyList.forEach(o => {
                    if (i.id === o.id) {
                        if (i.goal != o.goal) {
                            o.goal = i.goal;
                        }
                    }
                });
            });
            originalBuyList = originalBuyList;
        }
        return async ({ update }) => {
            await update({ reset: false });
        }
    }

    let goals = [];
    function goalInputKeydown(e, index) {
        if (e.key === 'Enter')
            goals[index].blur()
    }
    
    let deleted;
    $: {
        if (cardSwitch) {
            let originalIds = originalSellList.map(o => o.id);
            let ids = interests.map(i => i.id);
            deleted = originalIds.filter(o => !ids.includes(o));
        } else {
            let originalIds = originalBuyList.map(o => o.id);
            let ids = interests.map(i => i.id);
            deleted = originalIds.filter(o => !ids.includes(o));
        }
    }

    let updated;
    $: {
        updated = [];
        if (cardSwitch) {
            interests?.forEach(i => {
                originalSellList.forEach(o => {
                    if (i.id === o.id) {
                        if (i.goal != o.goal) {
                            updated.push(JSON.stringify({ id: i.id, goal: i.goal }));
                        }
                    }
                })
            });
        } else {
            interests?.forEach(i => {
                originalBuyList.forEach(o => {
                    if (i.id === o.id) {
                        if (i.goal != o.goal) {
                            updated.push(JSON.stringify({ id: i.id, goal: i.goal }));
                        }
                    }
                })
            });
        }
    }
</script>

<main>
<div class="layout-center">
    <MediaQuery query='(min-width: 650px)' let:matches>
        {#if matches}
            <h1>I'm interested in</h1>
        {/if}
    </MediaQuery>
    <div class="cardSwitch">
        <div class="switch-text" class:switched={cardSwitch}>buying</div>
        <label class="switch">
            <input type="checkbox" bind:checked={cardSwitch}>
            <span class="slider"></span>
        </label>
        <div class="switch-text" class:switched={!cardSwitch}>selling</div>
    </div>
</div>
{#if (interests.length === 0)}
    <div>You don't have any cards that you want to {intention}.</div>
{:else}
    <div class="card">
        <div class="card-img-container">
            {#each [...interests].reverse() as interest}
                <img transition:fade|local class="card-img p-absolute"
                    src={interest.card.face.front} alt="Magic the Gathering card" />
            {/each}
            <img class="card-img p-relative" src={cardFront} alt="Magic the Gathering card" />
            <div class="actions">
                <button on:click={handleDelete} class="action button">delete</button>
                <form class="action" method="POST" use:enhance={handleSubmit}>
                    <input type="hidden" name="deleted" hidden value={deleted} />
                    <input type="hidden" name="updated" hidden value={updated} />
                    <button class="button" disabled={noChanges}>save changes</button>
                </form>
            </div>
        </div>
        <div class="card-prints">
            <div class="scrollable" class:scroll={interests?.length > 7}>
                <table cellspacing="0">
                    <thead>
                        <tr>
                            <th>name</th>
                            <th></th>
                            <th>print</th>
                            <MediaQuery query='(min-width: 510px)' let:matches>
                                {#if matches}
                                    <th>price</th>
                                {/if}
                            </MediaQuery>
                            <th>trend</th>
                            <th>goal</th>
                        </tr>
                    </thead>
                    <tbody on:mouseleave={() => focusedPrintIndex = selectedPrintIndex}>
                        {#each interests as interest (interest.id)}
                            <tr transition:slide|local
                                animate:flip
                                on:mouseenter={() => focusedPrintIndex = interests.indexOf(interest)}
                                on:click={() => interestSelected(interests.indexOf(interest))} >
                                <td class:print-focused={interests.indexOf(interest) === focusedPrintIndex}
                                    class:print-highlight={interest.trendMeetsGoal}
                                    class:print-selected={interests.indexOf(interest) === selectedPrintIndex}>
                                    <div>{interest.card.name}</div>
                                <td class="setImage-container"
                                    class:print-focused={interests.indexOf(interest) === focusedPrintIndex}
                                    class:print-highlight={interest.trendMeetsGoal}
                                    class:print-selected={interests.indexOf(interest) === selectedPrintIndex}>
                                    <img class="setImg" src={interest.card.set.svg} alt="set img" />
                                </td>
                                <td class:print-focused={interests.indexOf(interest) === focusedPrintIndex}
                                    class:print-highlight={interest.trendMeetsGoal}
                                    class:print-selected={interests.indexOf(interest) === selectedPrintIndex}
                                    class="interest-print">
                                    <div class="print-info">
                                        <nobr>
                                            <MediaQuery query='(max-width: 700px)' let:matches>
                                                {#if matches}
                                                    <span class="set-code">{interest.card.set.code}</span> · #{interest.card.collectorNumber}
                                                {:else}
                                                    {interest.card.set.name} <span class="set-code">({interest.card.set.code})</span>
                                                {/if}
                                            </MediaQuery>
                                        </nobr>
                                        <div>
                                            <MediaQuery query='(max-width: 700px)' let:matches>
                                                {#if matches}
                                                    {interest.card.finishes[0]}
                                                {:else}
                                                    #{interest.card.collectorNumber} · {interest.card.rarity} · {interest.card.finishes[0]}
                                                {/if}
                                            </MediaQuery>
                                        </div>
                                    </div>
                                </td>
                                <MediaQuery query='(min-width: 510px)' let:matches>
                                    {#if matches}
                                        <td class:print-focused={interests.indexOf(interest) === focusedPrintIndex}
                                            class:print-highlight={interest.trendMeetsGoal}
                                            class:print-selected={interests.indexOf(interest) === selectedPrintIndex}>
                                            <div>{interest.price}</div>
                                        </td>
                                    {/if}
                                </MediaQuery>
                                <td class:print-focused={interests.indexOf(interest) === focusedPrintIndex}
                                    class:print-highlight={interest.trendMeetsGoal}
                                    class:print-selected={interests.indexOf(interest) === selectedPrintIndex}>
                                    <div>{interest.trendString}</div>
                                </td>
                                <td class:print-focused={interests.indexOf(interest) === focusedPrintIndex}
                                    class:print-highlight={interest.trendMeetsGoal}
                                    class:print-selected={interests.indexOf(interest) === selectedPrintIndex}>
                                    <div class="goal-container">
                                        <input bind:value={interest.goal}
                                            bind:this={goals[interests.indexOf(interest)]}
                                            on:keydown={(e) => goalInputKeydown(e, interests.indexOf(interest))}
                                            type=numeric class="goal" />
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            {#if interests.length != 0}
                <div class="chart">
                    <MediaQuery query='(max-width: 510px)' let:matches>
                        {#if matches}
                            <Chart data={activeInterest.dataDiff()}/>
                        {:else}
                            <Chart data={activeInterest.data()}/>
                        {/if}
                    </MediaQuery>
                </div>
            {/if}
        </div>
    </div>
{/if}
</main>

<style>
    .print-highlight {
        background-color: #a7330a;
        color: white;
    }
    .print-focused {
        background-color: #484066;
        color: white;
    }
    .print-selected {
        background-color: #36304c;
        color: white;
    }
    .print-highlight .setImg { filter: invert(1); }
    .print-focused .setImg { filter: invert(100); }
    .print-selected .setImg { filter: invert(100); }
    .print-highlight input {
        background-color: #b93b0d;
        color: white;
    }
    .print-focused input {
        background-color: inherit;
        color: inherit;
    }
    .print-selected input {
        background-color: inherit;
        color: inherit;
    }
    .goal {
        background-color: #dfdfdf;
        color: black;
        width: 50px;
        font-size: 17px;
    }
    .goal:hover {
        border: 1px solid rgba(255, 255, 255, 0.548);
    }
    .goal-container {
        display: flex;
        justify-content: center;
    }
    .goal-container::after {
        content: "%";
        margin-right: -15px;
        transform: translate(-20px, 3px);
    }
    .switched { opacity: 30%; }
    .switch-text {
        font-size: 32px;
        font-weight: bold;
    }
    h1 { text-align: center; }
    div :global(svg) {
        font-size: 3em;
    }
    .card {
        transition: 1s ease-out ;
        margin: auto;
        display: flex;
    }
    .interest-print { text-align: left; }
    table {
        border-spacing: 0 2px;
        width: -webkit-fill-available;
    }
    thead {
        position: relative;
        z-index: 2;
    }
    thead tr th {
        position: sticky;
        top: 0;
        background: #343242;
        padding: .2em 0;
        text-transform: capitalize;
    }
    tbody { cursor: pointer; }
    tbody tr td {
        padding: 0 .5em;
        background: #ecebef;
        color: black;
    }
    td:first-child { transform: translateX(1rem); }
    .set-code { text-transform: uppercase; }
    .card-img {
        border-radius: 30px;
        margin: 0;
        width: 340px;
        height: 470px;
        z-index: 1;
        left: 0;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    /* Hide default HTML checkbox */
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    /* The slider */
    .slider {
        border-radius: 34px;
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
        margin: 5px;
    }

    .slider:before {
        border-radius: 50%;
        position: absolute;
        content: "";
        height: 24px;
        width: 24px;
        left: 0;
        bottom: 0;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #a16b9b;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #a16b9b;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }

    .cardSwitch{
        align-items: center;
        display: flex;
        gap: 1em;
    }

    .actions{
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
    }
    .action{
        flex: 1;
    }
    .action button{
        width: 100%;
    }
    .print-info{
        display: flex;
        flex-direction: column;
        width: fit-content;
    }
</style>