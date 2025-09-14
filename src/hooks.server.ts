import { inspect } from "util";

export async function handle({ event, resolve }) {
  return await resolve(event);
}

export async function handleError(e) {
  //   console.log("error from handle error hook");
  //   console.error(inspect(e, true, null, true));
}
