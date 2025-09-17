import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  console.log(locals.session);
  if (!locals.session) {
    return redirect(303, "/login");
  } else {
    return {};
  }
}
