<script lang="ts">

    let { UserContent } = $props();
    
</script>

<div class="flex flex-col justify-center items-center border-2 border-blue-500 p-2 rounded-lg bg-white shadow-lg m-2 gap-5">
    
    <h1 class="md:text-3xl text-2xl font-bold">Paramètres</h1>

    <div class="flex flex-row gap-3 justify-between">
        <label for=""><h2 class="md:text-xl text-lg">Hauteur du véhicule (en centimètres) :</h2></label>
        <input type="number" placeholder="ex: 136" min="100" max="500" bind:value={$UserContent.hauteur}>
    </div>

    <div class="flex flex-row gap-3 justify-between">
        <label for=""><h2 class="md:text-xl text-lg">PMR (Mobilité réduite) :</h2></label>
        <input type="checkbox" name="" id="" bind:checked={$UserContent.pmr}/>
    </div>

    <div class="flex flex-row gap-3 justify-between">
        <label for=""><h2 class="md:text-xl text-lg">Véhicule électrique ? :</h2></label>
        <input type="checkbox" name="" id="" bind:checked={$UserContent.electrique}/>
    </div>
    
    <div class="flex flex-row gap-3 justify-between">
        <label for=""><h2 class="md:text-xl text-lg">Uniquement parking avec disponibilité :</h2></label>
        <input type="checkbox" name="" id="" bind:checked={$UserContent.dspOnly}/>
    </div>
</div>