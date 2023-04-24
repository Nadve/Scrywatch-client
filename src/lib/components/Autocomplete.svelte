<script> 
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';
    import { searchText } from '../appState.js';

    let focusedNameIndex = 0;
    let visibleCardNames = [];
    function navigate(e){
        if (e.key === "ArrowDown" && focusedNameIndex + 1 < visibleCardNames.length) {
            focusedNameIndex += 1;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault(); // suppress cursor jumping to the begining of the input
            if (focusedNameIndex != 0) {
                focusedNameIndex -= 1;
            }
        }
    }

    let formFocused;
    function handleBlur() {
        if (!formFocused) {
            visibleCardNames = [];
        }
    }

    export let cardNames = [];
    let cardName;
    searchText.subscribe(value => { cardName = value; });
    function handleInput() {
        if (cardName.length > 0) {
            visibleCardNames = cardNames.filter(n =>
                n.toLowerCase().startsWith(cardName.toLowerCase())).slice(0, 5);
        } else {
            visibleCardNames = [];
        }
    }

    let cardNameInput;
    onMount(function (){
        if (cardName === '')
            cardNameInput.focus();
    });

    $: search = visibleCardNames[focusedNameIndex];
    function handleSubmit(){
        if (!search) return;

        searchText.set(search);
        visibleCardNames = [];
        focusedNameIndex = 0;
        return async ({ update }) => {
            await update({ reset: false });
        }
    }
</script>

<svelte:window on:keydown={navigate} />

<div class="ac-container">
    <form class="autocomplete"
          autocomplete=off
          method="POST" action="?/getCards"
          use:enhance={handleSubmit}
          on:mouseenter={() => formFocused = true}
          on:mouseleave={() => formFocused = false}>
        <input type="hidden" name="cardName" hidden value={search} />
        <input class="autocomplete-input"
               type="text"
               spellcheck="false"
               bind:this={cardNameInput}
               bind:value={$searchText}
               on:click={() => cardNameInput.select()}
               on:blur={handleBlur}
               on:focus={handleInput}
               on:input={handleInput}>
        <ul class="autocomplete-items">
            {#each visibleCardNames as name, i}
                <li>
                    <button class="autocomplete-item"
                            class:autocomplete-focused={i === focusedNameIndex}
                            on:mouseenter={() => focusedNameIndex = i}>
                        {name}
                    </button>
                </li>
            {/each}
        </ul>
    </form>
</div>

<style>
    .ac-container {
        position: relative;
        margin: 0 auto 1em auto;
        max-width: 520px;
    }
    .autocomplete {
        position: relative;
        width: fit-content;
        margin: auto;
    }
    .autocomplete-input{
        position: relative;
        padding: 10px;
        width: 80vw;
        max-width: 500px;
        line-height: 1.25;
    }
    .autocomplete-items {
        position: absolute;
        border: 1px solid #d4d4d4;
        border-bottom: none;
        border-top: none;
        z-index: 99;
        top: 100%;
        left: 0;
        right: 0;
        margin: 0;
        padding: 0;
        list-style-type: none;
    }
    .autocomplete-item{
        background-color: var(--background-primary);
        text-align: left;
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #d4d4d4;
        width: 100%;
        color: inherit;
        font: inherit;
    }
    .autocomplete-focused { background-color: var(--background-secondary); }
</style>
