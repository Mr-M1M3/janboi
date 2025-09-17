import prisma from "$lib/db.server";
import { superValidate, fail } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { TOPIC_PAYLOAD } from "./schemas/TopicPayload.schema.js";
import { error, isRedirect, redirect } from "@sveltejs/kit";
import is_the_prompt_safe from "$lib/ai/safety-cheker.ai.js";
import { gen_ques_q } from "./producers/gen-ques.producer.js";
import Result from "$lib/utils/result/result.util.js";
import type { ErrorResponseData } from "$lib/types/ResponseData.type.js";
export async function load() {
  const form = await superValidate(valibot(TOPIC_PAYLOAD));
  return { form };
}

export const actions = {
  async generate_question({ request, locals }) {
    const rec_data = await superValidate(request, valibot(TOPIC_PAYLOAD));
    if (!rec_data.valid) {
      return fail(
        400,
        Result.Err({ form: rec_data }).serialize(400, "bad request", rec_data)
      );
    }
    if (!(await is_the_prompt_safe(rec_data.data.topic))) {
      return fail(
        400,
        Result.Err({ form: rec_data }).serialize(400, "bad request", rec_data)
      );
    }
    try {
      const topic = await prisma.topic.create({
        data: {
          name: rec_data.data.topic,
          user: {
            connect: {
              id: locals.session?.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      await gen_ques_q.add(
        topic.id,
        {
          topic: rec_data.data.topic,
          for_topic: topic.id,
        },
        {
          attempts: 3,
          backoff: {
            type: "fixed",
            delay: 2,
          },
          removeOnComplete: true,
          removeOnFail: {
            age: 60 * 60 * 24 * 7,
          },
        }
      );
      redirect(303, `/topics/${topic.id}`);
    } catch (err) {
      if (isRedirect(err)) {
        throw err;
      }
      // TODO: LOG
      console.error(err);
      error(
        500,
        Result.Err({}).serialize(500, "internal error") as ErrorResponseData<
          Record<never, never>
        >
      );
    }
  },
};
