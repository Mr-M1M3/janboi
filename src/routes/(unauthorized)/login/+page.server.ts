import config from "$lib/config.js";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  if (locals.session) {
    return redirect(303, "/");
  } else {
    return {};
  }
}
