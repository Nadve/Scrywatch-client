<script>
    let warning = "";
    export let form;
    $: if(form){
        warning = form.response;
    }
</script>

<main class="centered">
    <form method="POST">
        <div class="container">
            <input type="text" name="email" placeholder="email" required>
            <input type="password" name="password" placeholder="password" required>
            <button class="submit" type="submit">Login</button>
        </div>
    </form>
    <ul class="warning">
        {#if (warning !== "")}
            <li>{warning}</li>
        {/if}
    </ul>
</main>

<style>
    .warning{
        text-align: left;
    }
</style>