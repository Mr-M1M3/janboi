<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";
  const { data } = $props();
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
  <div class="prose py-2">
    {@html data.data.lesson.content}
  </div>
{/if}
