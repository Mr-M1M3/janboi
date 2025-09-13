import prisma from "$lib/db.server";
import { superValidate, fail } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { TOPIC_PAYLOAD } from "./schemas/TopicPayload.schema.js";
import { error, isRedirect, redirect } from "@sveltejs/kit";
import is_the_prompt_safe from "$lib/ai/safety-cheker.ai.js";
import { gen_ques_q } from "./producers/gen-ques.producer.js";
import { GEN_QUES_U_PROMPT } from "$env/static/private";
import Result from "$lib/utils/result/result.util.js";
import type { ErrorResponseData } from "$lib/types/ResponseData.type.js";
export async function load() {
  const form = await superValidate(valibot(TOPIC_PAYLOAD));
  return { form };
}

export const actions = {
  async generate_question({ request }) {
    const rec_data = await superValidate(request, valibot(TOPIC_PAYLOAD));
    if (!rec_data.valid) {
      return fail(400, Result.Err({}).serialize(400, "bad request"));
    }
    if (!(await is_the_prompt_safe(rec_data.data.topic))) {
      return fail(400, Result.Err({}).serialize(400, "bad request"));
    }
    try {
      const topic = await prisma.topic.create({
        data: {
          name: rec_data.data.topic,
          status: "ASKING_QUES",
        },
        select: {
          id: true,
        },
      });
      await gen_ques_q.add(topic.id, {
        prompt: `${GEN_QUES_U_PROMPT} \n ${rec_data.data.topic}`,
        for_topic: topic.id,
      });
      redirect(303, `/topics/${topic.id}`);
    } catch (err) {
      if (isRedirect(err)) {
        throw err;
      }
      error(
        500,
        Result.Err({}).serialize(500, "internal error") as ErrorResponseData<
          Record<never, never>
        >
      );
    }
  },
};
