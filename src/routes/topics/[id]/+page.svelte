<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { browser } from "$app/environment";
  import { superForm } from "sveltekit-superforms";
  import Questions from "./components/Questions.svelte";

  const { data } = $props();
  console.log(data);
  let interval;
  if (browser && data.data?.topic.status === "GENERATING_QUES") {
    interval = setInterval(() => {
      console.log("invalidating");
      invalidate("topic-state");
    }, 2000);
  } else {
    clearInterval(interval);
  }
  let sf = superForm(
    data.data ? data.data.form : data.details ? data.details.form : {},
    {
      dataType: "json",
    }
  );
  const topic = data.data?.topic;
</script>

<header class="w-full m-auto h-screen px-2 py-4">
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
          <h1 class="d-card-title text-2xl uppercase text-neutral">
            {topic?.name}
          </h1>
          <p class="text-secondary">
            Don't panic! These questions are just to figure out how much in deep
            should I explain.
          </p>
        </div>
        <div class="w-full h-full bg-red300">
          <Questions
            questions={topic.questions}
            topic_id={data.data?.topic.id || ""}
            {sf}
          />
        </div>
      </div>
    </div>
  {/if}
</header>
