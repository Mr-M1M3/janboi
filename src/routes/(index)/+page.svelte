<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import SuperDebug from "sveltekit-superforms";
  const { data } = $props();
  const { form, constraints } = superForm(data.form);
</script>

<SuperDebug data={$form}></SuperDebug>
<form action="?/generate_question" method="POST">
  <input
    type="text"
    name="topic"
    bind:value={$form.topic}
    {...$constraints.topic}
  />
</form>
