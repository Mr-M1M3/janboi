import { inspect } from "util";

export async function handle({ event, resolve }) {
  // console.log(
  //   "received request",
  //   inspect(await event.request.clone().text(), true, null, true)
  // );
  const resp = await resolve(event);
  // console.log(
  //   "returning",
  //   inspect(await resp.clone().text(), true, null, true)
  // );
  return resp;
}

export async function handleError(e) {
  console.log("error from handle error hook");
  console.error(inspect(e, true, null, true));
}
