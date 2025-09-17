import { inspect } from "util";
import { auth } from "$lib/better-auth/auth.server";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

export async function handle({ event, resolve }) {
  // Fetch current session from Better Auth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  event.locals.session = session ?? null;

  return svelteKitHandler({ event, resolve, auth, building });
}

export async function handleError(e) {
  console.log("error from handle error hook");
  console.error(inspect(e, true, null, true));
}
