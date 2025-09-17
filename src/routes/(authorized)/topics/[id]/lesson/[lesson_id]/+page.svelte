<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";
  import Icon from "@iconify/svelte";
  import { page } from "$app/state";
  const { data } = $props();
  function nav_back() {
    window.history.back();
  }
  let interval: ReturnType<typeof setInterval>;
  $effect(() => {
    if (data.data?.lesson.status === "GENERATING") {
      interval = setInterval(() => {
        invalidate("lesson-state");
      }, 2000);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  });
</script>

<svelte:head></svelte:head>

{#if data.data?.lesson.status === "WAITING_FOR_APPROVAL"}
  <form
    action="?/generate"
    method="POST"
    class="w-full h-full flex justify-center items-center"
    use:enhance
  >
    <button type="submit" class="d-btn d-btn-neutral">Generate content</button>
  </form>
{/if}
{#if data.data?.lesson?.status === "GENERATING"}
  <div class="h-full w-full flex gap-4 justify-center items-center">
    <h1 class="d-loading d-loading-ring d-loading-xl">Loading...</h1>
    <p>You can close this page and visit later...</p>
  </div>
{/if}
{#if data.data?.lesson.status === "GENERATED"}
  <div class="wrapper flex gap-2 py-4">
    <div>
      <button onclick={nav_back} class="d-btn d-btn-ghost"
        ><Icon icon="mdi:arrow-left" class="text-xl" /></button
      >
    </div>
    <div class="prose grow">
      {@html data.data.lesson.content}
    </div>
  </div>
{/if}
{#if data.data?.lesson.status === "FAILED"}
  <div class="prose">
    <h1>We failed to generate a lesson</h1>
    <form
      action="?/generate"
      method="POST"
      class="w-full h-full flex justify-center items-center"
      use:enhance
    >
      <button type="submit" class="d-btn d-btn-neutral">Generate Again</button>
    </form>
  </div>
{/if}
