<script>
  import { createAuthClient } from "better-auth/svelte";
  const auth_client = createAuthClient();
  const session = auth_client.useSession();
  console.log($session);
</script>

<div class="prose">
  <h1>Login</h1>
  <button
    class="d-btn d-btn-neutral"
    onclick={() => {
      auth_client.signIn.social({ provider: "google" });
    }}>Login with google</button
  >
</div>
