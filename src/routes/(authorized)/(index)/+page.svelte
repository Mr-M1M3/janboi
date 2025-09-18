<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import Icon from "@iconify/svelte";
  const { data } = $props();
  const { form, constraints } = superForm(data.form);
</script>

<div class="w-full px-4 h-full flex flex-col justify-center items-center">
  <div>
    <h4 class="text-4xl font-extrabold">What can help you learn? 😎</h4>
    <p class="text-base-content text-right">
      Type any topic you want to learn about and see the magic happen...
    </p>
  </div>
  <form
    action="?/generate_question"
    method="POST"
    class="flex justify-center items-center w-full md:w-md my-4"
  >
    <input
      class="d-input w-full"
      type="text"
      name="topic"
      bind:value={$form.topic}
      {...$constraints.topic}
    />
    <button class="d-btn d-btn-lg d-btn-neutral d-mask d-mask-hexagon">
      <Icon icon="lucide:brain-circuit" font-size="large" />
    </button>
  </form>
</div>
