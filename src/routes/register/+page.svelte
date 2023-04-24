<script>
    let warnings = [];
    export let form;
    $: if(form){
        warnings = form.response.split(/[\r\n]+/);
    }
</script>

<main class="centered">
    <form method="POST">
        <div class="container">
            <input type="text" name="email" placeholder="email" required>
            <input type="password" name="password1" placeholder="password" required>
            <input type="password" name="password2" placeholder="repeat password" required>
            <button class="submit">Register</button>
        </div>
    </form>
    <ul class="warning">
        {#each warnings as warning}
            <li>{warning}</li>
        {/each}
    </ul>
</main>

<style>
    .warning{
        text-align: left;
    }
</style>