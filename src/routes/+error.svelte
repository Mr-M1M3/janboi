<script>
  import { page } from "$app/state";
  console.log(page.error);
</script>

<h1 class="text-3xl font bold text-red-600 uppercase">Error</h1>
<h3>{page.error?.status}</h3>
<p>{page.error?.message}</p>
