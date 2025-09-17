<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { superForm } from "sveltekit-superforms";
  import Questions from "./components/Questions.svelte";
  import { Toaster, toast } from "svelte-sonner";
  import Outline from "./components/Outline.svelte";
  const { data, form } = $props();
  let topic_interval: ReturnType<typeof setInterval>;
  let outline_interval: ReturnType<typeof setInterval>;
  let topic = $derived(data.data?.topic);
  let outline = $derived(topic?.outline);
  $effect(() => {
    if (form && !form.success) {
      toast.error(form.message.toUpperCase());
    }
    if (topic?.status === "GENERATING_QUES") {
      topic_interval = setInterval(() => {
        invalidate("topic-state");
      }, 2000);
    } else {
      clearInterval(topic_interval);
    }
    if (outline?.status === "GENERATING") {
      outline_interval = setInterval(() => {
        invalidate("outline-state");
      }, 2000);
    } else {
      clearInterval(outline_interval);
    }
    return () => {
      clearInterval(topic_interval);
      clearInterval(outline_interval);
    };
  });
  let sf = $derived(
    superForm(
      data.data ? data.data.form : data.details ? data.details.form : {},
      {
        dataType: "json",
      }
    )
  );
</script>

<Toaster richColors />
{#key data}
  <header class="w-full m-auto h-full px-2 py-4">
    {#if topic?.status === "GENERATING_QUES"}
      <div class="h-full w-full flex gap-4 justify-center items-center">
        <h1 class="d-loading d-loading-ring d-loading-xl">Loading...</h1>
        <p>You can close this page and visit later...</p>
      </div>
    {/if}
    {#if topic?.status === "GETTING_ANS"}
      <div class="h-full d-card d-card-border">
        <div class="d-card-body">
          <div>
            <h1 class="d-card-title text-2xl text-neutral">
              {topic?.meta || topic?.name}
            </h1>
            <p class="text-secondary">
              Don't panic! These questions are just to figure out how much in
              deep should I explain.
            </p>
          </div>
          <div class="w-full h-full">
            <Questions
              questions={topic.questions}
              topic_id={data.data?.topic.id || ""}
              {sf}
            />
          </div>
        </div>
      </div>
    {/if}
    {#if topic?.status === "GOT_ANS"}
      {#if topic.outline?.status === "GENERATING"}
        <div class="h-full w-full flex gap-4 justify-center items-center">
          <h1 class="d-loading d-loading-ring d-loading-xl">Loading...</h1>
          <p>Generating outline, You can close this page and visit later...</p>
        </div>
      {/if}
      {#if topic.outline?.status === "GENERATED"}
        <div class="prose">
          <h2>{topic?.meta || topic?.name}</h2>
          <Outline outline={topic.outline} />
        </div>
      {/if}
      {#if topic.outline?.status === "FAILED"}
        <div class="prose">
          <h1>We failed to generate an outline.</h1>
        </div>
      {/if}
    {/if}
    {#if topic?.status === "FAILED"}
      <div class="prose">
        <h1>We failed to generate an outline</h1>
      </div>
    {/if}
  </header>
{/key}
