<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import Icon from "@iconify/svelte";
  import type { TransitionConfig } from "svelte/transition";
  import logo from "$lib/assets/logo.svg";
  let { data, children } = $props();
  let is_sidebar_active = $state(false);
  type TransitionOpt = {
    duration?: number;
    easing?: (t: number) => number;
  };
  function sidebar_transition(
    node: HTMLElement,
    opt?: TransitionOpt
  ): TransitionConfig {
    return {
      duration: opt?.duration ?? 200,
      easing: opt?.easing,
      css(t) {
        return `
        width: ${t * 100}%
        `;
      },
    };
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>
<main class="h-screen max-w-6xl m-auto p-2">
  <nav
    class="brand h-12 flex gap-2 justify-between items-center px-2 shadow d-rounded-box mb-2"
  >
    <div>
      <label for="sidebar" class="flex cursor-pointer lg:hidden">
        <input
          type="checkbox"
          id="sidebar"
          bind:checked={is_sidebar_active}
          hidden
        />
        <Icon icon="lucide:menu" class="text-xl" />
      </label>
    </div>
    <div class="d-navbar-center gro flex gap-2">
      <a href="/"> <img src={logo} alt="logo" class="h-8 w-8" /></a>
      <!-- <h1 class="uppercase">Janboi</h1> -->
    </div>
  </nav>
  <div class="wrapper flex flex-row gap-2 h-[calc(100%-3rem-1rem)]">
    {#key is_sidebar_active}
      <div
        class="sidebar w-xl lg:w-sm overflow-hidden relative {is_sidebar_active
          ? ''
          : 'hidden'} lg:block"
        transition:sidebar_transition|global
      >
        <ul
          class="d-menu w-xl lg:w-sm h-full overflow-y-auto overflow-x-hidden rounded-box"
        >
          {#if data.data}
            <li>
              <h2 class="d-menu-title">Previous asked topics</h2>
              <ul>
                {#each data.data.topics as topic (topic.id)}
                  <li><a href="/topics/{topic.id}">{topic.name}</a></li>
                {:else}
                  <p>Previously asked topics will be listed here</p>
                {/each}
              </ul>
            </li>
          {/if}
        </ul>
      </div>
      <div
        class="d-divider d-divider-horizontal {is_sidebar_active
          ? ''
          : 'hidden'} "
      ></div>
    {/key}
    <div
      class="grow content {is_sidebar_active
        ? 'opacity-50 blur-sm pointer-events-none select-none'
        : ''}"
    >
      {@render children?.()}
    </div>
  </div>
</main>
