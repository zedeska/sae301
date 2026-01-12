<script lang="ts">
    import { goto } from "@mateothegreat/svelte5-router";

    export let open: boolean = false;

</script>

{#if open}
    <!-- Backdrop to close menu when clicking outside -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed inset-0 z-10" on:click={() => open = false}></div>
{/if}

<nav class="absolute left-1 top-1 z-20 bg-white p-2 rounded-md flex gap-4 items-center">
    <div class="relative">
        <button class="cursor-pointer" on:click={() => open = !open}><i class="fa-regular fa-circle-user"></i></button>
        {#if open}
            <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-20 border border-gray-100 overflow-hidden">
                <button 
                    class="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors" 
                    on:click={() => { goto("/parametres"); open = false; }}
                >
                    Paramètres
                </button>
            </div>
        {/if}
    </div>
    <button class="cursor-pointer" on:click={() => goto("/")} ><i class="fa-solid fa-house"></i></button>
</nav>