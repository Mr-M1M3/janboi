<script lang="ts">
  import { page } from "$app/state";
  const { data } = $props();
  console.log(data);
</script>

<h1>{page.params.id}</h1>
