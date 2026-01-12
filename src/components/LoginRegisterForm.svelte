<script lang="ts">
  import { get, type Writable } from 'svelte/store';
  import type User from '../user';
  
  interface Props {
    UserContent: Writable<User>;
  }

  let {UserContent}: Props = $props();
  
  let errorMessage = $state("");
  let username = $state("");
  let password = $state("");
  let register = $state(false);

</script>

<div class="items-center justify-center ml-auto mr-auto min-h-screen flex flex-col">
  {#if errorMessage !== ""}
  <div class="text-red-600 text-center mt-2">
    {errorMessage}
  </div>
{/if}
{#if register}
    <div class="w-5/6 flex flex-col gap-3 border-2 border-[#007cbf] rounded-lg p-4 text-center">
      <h2>S'enregistrer sur Parkest</h2>
      <input type="text" bind:value={username} placeholder="Username" required />
      <input type="password" bind:value={password} placeholder="Password" required />
      <button onclick={() => { register = false; username = ""; password = ""; }} class="cursor-pointer text-xs text-[#007cbf]" >Login</button>
      <button class="cursor-pointer" onclick={async () => {
        try{
          await get(UserContent).register(username, password);
          UserContent.update((u) => u);
          window.location.reload();
        } catch (error) {
          console.error("Register error", error);
          errorMessage = String(error);
        }
      }}>Register</button>
    </div>
{:else}
    <div class="w-5/6 flex flex-col gap-3 border-2 border-[#007cbf] rounded-lg p-4 text-center">
      <h2>Se connecter à Parkest</h2>
      <input type="text" bind:value={username} placeholder="Username" required />
      <input type="password" bind:value={password} placeholder="Password" required />
      <button onclick={() => { register = true; username = ""; password = ""; }} class="cursor-pointer text-xs text-[#007cbf]">Register</button>
      <button class="cursor-pointer" onclick={async () => {
        try{
          await get(UserContent).login(username, password);
          UserContent.update((u) => u);
          window.location.reload();
        } catch (error) {
          console.error("Login error", error);
          errorMessage = String(error);
        }
      }}>Login</button>
    </div>
{/if}
</div>