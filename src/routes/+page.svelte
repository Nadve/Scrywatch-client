<script>
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import MediaQuery from 'svelte-media-queries';
    import Chart from '$lib/components/Chart.svelte';
	import Autocomplete from "$lib/components/Autocomplete.svelte";
    import FinishSelect from '$lib/components/FinishSelect.svelte';
    import { Card } from '$lib/types/card.js';
    import { Finish } from '$lib/types/finish.js';
    import { Currency } from '$lib/types/currency.js';
    import { Interest } from "$lib/types/interest.js";
    import { Intention } from '$lib/types/intention.js';
    import {
        cardVisible,
        searchText,
        cardList,
        buyList,
        sellList
    } from '$lib/appState.js';

    export let data;
    export let form;
    $: {
        let newInterest = form?.interest;
        if (newInterest) {
            const interest = new Interest(newInterest.id,
                newInterest.intention, newInterest.card, newInterest.goal)
            if (interest.intention === Intention.Buy) {
                $buyList = [...$buyList, interest];
            }
            else if (interest.intention === Intention.Sell) {
                $sellList = [...$sellList, interest];
            }
        }

        let cardsJson = form?.cardsJson;
        if (cardsJson) {
            focusedPrintIndex = 0;
            selectedPrintIndex = 0;
            cardList.set(cardsJson.map(c => new Card(c.id, c.name, c.rarity,
                c.collectorNumber, c.set, c.face, c.finishes, c.prices)));
            cardVisible.set(true);
        }
    }

    let buyInterest;
    buyList.subscribe(value => { buyInterest = value; });

    let sellInterest;
    sellList.subscribe(value => { sellInterest = value; });

    let visible;
    cardVisible.subscribe(value => { visible = value; });

    let cardName;
    searchText.subscribe(value => { cardName = value; });

    let cards;
    cardList.subscribe(value => { cards = value; });

    let focusedPrintIndex = 0;
    let selectedPrintIndex = 0;
    let currency = Currency.Eur;
    $: activeCard = cards[selectedPrintIndex];
    $: cardFront = activeCard?.face?.front;

    function handleSubmit() {
        addingInterest = true;
        setTimeout(() => addingInterest = false, 500);
        return async ({ update }) => {
            await update({ reset: false });
        }
    }

    function currencyChanged() {
        cards.forEach(c => c.currency = currency);
        cards = cards;
    }

    $: buyBtnDisabled = !$page.data.auth ||
        buyInterest.filter(i =>
            i.card.id === activeCard?.id &&
            i.finish === activeCard?.finish &&
            i.currency === activeCard?.currency)
            .length > 0;

    $: sellBtnDisabled = !$page.data.auth ||
        sellInterest.filter(i =>
            i.card.id === activeCard?.id &&
            i.finish === activeCard?.finish &&
            i.currency === activeCard?.currency)
            .length > 0;

    let addingInterest = false;
</script>

<main>
<Autocomplete cardNames={data.cardNames} />
{#if (visible)}
<div class="card">
    <div class="card-header">
        <div class="card-img-container">
            <img class="card-img"
                src={cardFront} alt="Magic the Gathering card" />
            <img class="card-img card-effect"
                class:fly={addingInterest}
                src={cardFront} alt="Magic the Gathering card" />
        </div>
        <div data-tooltip="To create interests you have to be logged in"
            class="user-actions" class:hasTooltip={!$page.data.auth}>
            <div class="d-flex">
                <div class="hr"></div>
                <nobr class="action-info">I'm interested in</nobr>
                <div class="hr"></div>
            </div>
            <div class="btn-container">
                <form class="stretch" action="?/interestCreate" method="POST"
                    use:enhance={handleSubmit}>
                    <input type="hidden" name="id" hidden value={activeCard?.id} />
                    <input type="hidden" name="finish" hidden value={activeCard?.finish} />
                    <input type="hidden" name="currency" hidden value={activeCard?.currency} />
                    <input type="hidden" name="intention" hidden value={Intention.Sell}/>
                    <button class="button stretch" disabled={sellBtnDisabled}>Selling</button>
                </form>
                <form class="stretch" action="?/interestCreate" method="POST"
                    use:enhance={handleSubmit}>
                    <input type="hidden" name="id" hidden value={activeCard?.id} />
                    <input type="hidden" name="finish" hidden value={activeCard?.finish} />
                    <input type="hidden" name="currency" hidden value={activeCard?.currency} />
                    <input type="hidden" name="intention" hidden value={Intention.Buy}/>
                    <button class="button stretch" disabled={buyBtnDisabled}>Buying</button>
                </form>
            </div>
        </div>
    </div>
    <div class="card-prints">
        <div class="scrollable" class:scroll={cards.length > 7}>
            <table cellspacing="0">
                <thead>
                    <tr>
                        <th></th>
                        <th>prints</th>
                        <th>nonfoil</th>
                        <th>foil</th>
                        <th>etched</th>
                        <th>
                            <select class="filter"
                                bind:value={currency}
                                on:change={currencyChanged}>
                                <option>{Currency.Eur}</option>
                                <option>{Currency.Usd}</option>
                                <option>{Currency.Tix}</option>
                            </select>
                        </th>
                    </tr>
                </thead>
                <tbody on:mouseleave={() => focusedPrintIndex = selectedPrintIndex}>
                    {#each cards as card, i}
                        <tr on:mouseenter={() => focusedPrintIndex = i}
                            on:click={() => selectedPrintIndex = i}>
                            <td class="setImage-container"
                                class:print-focused={i === focusedPrintIndex}
                                class:print-selected={i === selectedPrintIndex}>
                                <img class="setImg" src={card.set.svg} alt="set img" />
                            </td>
                            <td class:print-focused={i === focusedPrintIndex}
                                class:print-selected={i === selectedPrintIndex}
                                class="print-details">
                                <div class="d-flex column">
                                    <nobr>
                                        <MediaQuery query='(max-width: 570px)' let:matches>
                                            {#if matches}
                                                <span class="set-code">{card.set.code}</span>
                                            {:else}
                                                {card.set.name} <span class="set-code">({card.set.code})</span>
                                            {/if}
                                        </MediaQuery>
                                    </nobr>
                                    <div>
                                        #{card.collectorNumber} · {card.rarity}
                                    </div>
                                </div>
                            </td>
                            <td class:print-focused={i === focusedPrintIndex}
                                class:print-selected={i === selectedPrintIndex}>
                                <FinishSelect bind:card={card} finish={Finish.Nonfoil}/>
                            </td>
                            <td class:print-focused={i === focusedPrintIndex}
                                class:print-selected={i === selectedPrintIndex}>
                                <FinishSelect bind:card={card} finish={Finish.Foil}/>
                            </td>
                            <td class:print-focused={i === focusedPrintIndex}
                                class:print-selected={i === selectedPrintIndex}>
                                <FinishSelect bind:card={card} finish={Finish.Etched}/>
                            </td>
                            <td class:print-focused={i === focusedPrintIndex}
                                class:print-selected={i === selectedPrintIndex}>
                                <div>{card.price}</div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        {#if cards.length != 0}
            <div class="chart">
                <Chart data={activeCard.data}/>
            </div>
        {/if}
    </div>
</div>
{/if}
</main>

<style>

    /* Card image */
    .card-header{
        margin: 0 auto;
        width: fit-content;
    }
    .card-img {
        border-radius: 30px;
        margin: 0;
        width: 340px;
        height: 470px;
        position: relative;
        z-index: 1;
    }
    .card-effect {
        position: absolute;
        left: 0;
    }
    .fly {
        opacity: 0;
        transform: translate(77vw, -30vh) scale(.3);
        transition: 350ms ease-out transform,
            500ms ease-out opacity;
    }

    /* User actions */
    .user-actions {
        border: 1px solid var(--border-primary);
        border-top: none;
        position: relative;
        gap: 1em;
        margin-top: 1em;
    }
    .action-info {
        padding: 0 1em;
        transform: translateY(-50%);
    }
    .hr {
        width: 100%;
        border-top: 1px solid var(--border-primary);
    }
    .btn-container {
        display: flex;
        gap: 1em;
        padding: 1em;
    }

    /* Card prints */
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
        background: var(--background-tertiary);
        padding: .2em 0;
        text-transform: capitalize;
    }
    tbody { cursor: pointer; }
    tbody tr td {
        padding: 0 .5em;
        background: #ecebef;
        color: black;
    }
    .filter{
        background: var(--background-tertiary);
        border: none;
        outline: none;
        color: inherit;
        text-transform: capitalize;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
    }
    .print-focused {
        background-color: #484066;
        color: white;
    }
    .print-selected {
        background-color: var(--background-primary);
        color: white;
    }
    .print-selected .setImg { filter: invert(100); }
    .print-focused .setImg { filter: invert(100); }
    .print-details {
        text-align: left;
        padding: 0;
    }
    .set-code { text-transform: uppercase; }

    /* Tooltip */
    .hasTooltip::before,
    .hasTooltip::after {
        --scale: 0;
        --tooltip-color: #333;
        --arrow-size: 10px;

        position: absolute;
        left: 50%;
        top: .25rem;
        transform: translateX(-50%)
            translateY(var(--translate-y, 0))
            scale(var(--scale));
        transform-origin: bottom center;
        transition: 350ms transform;
        z-index: 2;
    }
    .hasTooltip::before{
        --translate-y: calc(-100% - var(--arrow-size));

        content: attr(data-tooltip);
        background: var(--tooltip-color);
        border-radius: .3rem;
        padding: .5rem;
        text-align: center;
        width: max-content;
        max-width: 100%;
    }
    .hasTooltip::after {
        --translate-y: calc(-1 * var(--arrow-size));

        border: var(--arrow-size) solid transparent;
        border-top-color: var(--tooltip-color);
        content: '';
        transform-origin: top center;
    }
    .hasTooltip:hover::before,
    .hasTooltip:hover::after { --scale: 1; }
</style>