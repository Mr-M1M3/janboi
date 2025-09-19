<script>
  import Icon from "@iconify/svelte";
  import { createAuthClient } from "better-auth/svelte";
  const auth_client = createAuthClient();
</script>

<svelte:head>
  <title>Janboi - Login to Continue</title>
</svelte:head>
<div class="prose h-full flex flex-col justify-center items-center">
  <h1>Login to Continue</h1>
  <button
    class="d-btn d-btn-neutral"
    onclick={() => {
      auth_client.signIn.social({ provider: "google" });
    }}
  >
    <Icon icon="cib:google" />
    Continue With Google
  </button>
</div>
