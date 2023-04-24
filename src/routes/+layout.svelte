<script>
    import '../app.css';
    import { page } from '$app/stores';
    import { buyList, sellList } from '$lib/appState.js';
    import { Interest } from '$lib/types/interest.js';
    import { Intention } from '$lib/types/intention.js';

    export let data;

    $:path = $page.url.pathname.split("/")[1];
    if (data.auth) {
        if ($buyList.length === 0) {
            buyList.set(data.interests
                .filter(i => i.intention === Intention.Buy)
                .map(i => new Interest(i.id, i.intention, i.card, i.goal)));
        }

        if ($sellList.length === 0) {
            sellList.set(data.interests
                .filter(i => i.intention === Intention.Sell)
                .map(i => new Interest(i.id, i.intention, i.card, i.goal)));
        }
    }
</script>

<nav class="nav">
    {#if (data.auth)}
        <a class="nav-item"
            class:active={path === ""} 
            href="/">Home</a>
        <a class="nav-item"
            class:active={path === "interests"} 
            href="/interests">Interests</a>
        <form class="logout"t
            action="logout" method="POST">
            <button type="submit">Logout</button>
        </form>
    {:else}
        <a class="nav-item"
            class:active={path === ""}
            href="/">Home</a>
        <a class="nav-item"
            class:active={path === "login"}
            href="/login">Login</a>
        <a class="nav-item"
            class:active={path === "register"}
            href="/register">Register</a>
    {/if}
</nav>

<slot />

<style>
    .nav {
        font-size: 1.3rem;
        padding-top: .5em;
        text-align: right;
        width: 100%;
    }
    .nav-item {
        color: white;
        text-decoration: none;
        margin-right: 1rem;
    }
    .active {
        border-bottom: 2px solid white;
        padding-bottom: .5em;
    }
    .logout { display: inline; }
    .logout button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: inherit;
        font-weight: inherit;
    }
</style>