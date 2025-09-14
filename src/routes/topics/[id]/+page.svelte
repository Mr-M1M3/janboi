<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import SuperDebug from "sveltekit-superforms";
  import { page } from "$app/state";
  const { data } = $props();
  let { form, enhance } = superForm(
    data.data ? data.data.form : data.details ? data.details.form : {},
    {
      dataType: "json",
    }
  );
  console.log(data);
  // console.log("data");
  // console.log(data);
  // console.log("form");
  // console.log(page.form);
  // console.log("error");
  // console.log(page.error);
</script>

{#if data.success}
  <h1 class="text-2xl font-bold capitalize">{data.data.topic.name}</h1>
  {#if data.data.topic.status === "ASKING_QUES"}
    <p>Generating questions for you. Please wait....</p>
  {:else if data.data.topic.status === "GETTING_ANS"}
    <p>questions:</p>
    <SuperDebug data={$form} />
    <form method="POST" action="?/answer" use:enhance>
      {#each data.data.topic.questions as question (question.id)}
        <div class="my-4 flex flex-col">
          <label for={question.id}>{question.title}</label>
          <datalist id={`datalist-${question.id}`} class="mx-4">
            {#each question.options as option (option.id)}
              <option>{option.content}</option>
            {/each}
          </datalist>
          <input
            list={`datalist-${question.id}`}
            type="text"
            name={question.id}
            bind:value={$form[question.id]}
          />
        </div>
      {/each}
      <input
        type="text"
        name="topic_id"
        bind:value={$form["topic_id"]}
        readonly
        hidden
      />
      <button
        type="submit"
        class="border bg-sky-600 text-white font-bold px-6 py-2">Submit</button
      >
    </form>
  {/if}
{/if}
