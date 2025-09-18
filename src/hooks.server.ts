import { inspect } from "util";
import { auth } from "$lib/better-auth/auth.server";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { url } from "inspector";

export async function handle({ event, resolve }) {
  // Fetch current session from Better Auth
  console.log(`\n\n\n\n\n\n${event.url.host}\n\n\n\n`);
  const session = await auth(event.url.origin).api.getSession({
    headers: event.request.headers,
  });
  event.locals.session = session ?? null;

  return svelteKitHandler({ event, resolve, auth: auth(event.url.origin), building });
}

export async function handleError(e) {
  console.error("error from handle error hook");
  console.error(inspect(e, true, null, true));
}
