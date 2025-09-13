import prisma from "$lib/db.server";
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { TOPIC_PAYLOAD } from "./schemas/TopicPayload.schema.js";
import { ClientError } from "$lib/utils/errors/client-error.util.js";
import { error } from "@sveltejs/kit";
export async function load() {
  const form = await superValidate(valibot(TOPIC_PAYLOAD));
  return { form };
}

export const actions = {
  async generate_question({ request }) {
    const rec_data = await superValidate(request, valibot(TOPIC_PAYLOAD));
    if (!rec_data.valid) {
      error(
        400,
        new ClientError(400, "bad request", {}).to_result().transform()
      );
    }
  },
};
