import prisma from "$lib/db.server.js";
import type { ErrorResponseData } from "$lib/types/ResponseData.type.js";
import Result from "$lib/utils/result/result.util.js";
import { error, fail, isHttpError } from "@sveltejs/kit";
import { superValidate, type SuperValidated } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { ANSWER_PAYLOAD } from "./schemas/AnswersPayload.schema.js";
import { inspect } from "node:util";
import type { Entries } from "$lib/types/Entries.type.js";
import { PrismaClientKnownRequestError } from "$lib/generated/prisma/internal/prismaNamespace.js";
import { gen_outline_q } from "./producers/gen-outline.producer.js";
export async function load({ params }) {
  // if the job already done
  try {
    const topic = await prisma.topic.findUnique({
      where: {
        id: params.id,
      },
      select: {
        status: true,
        id: true,
        name: true,
        questions: {
          select: {
            id: true,
            title: true,
            options: {
              select: {
                id: true,
                content: true,
              },
            },
            answer: true,
          },
        },
      },
    });
    if (!topic) {
      error(
        404,
        Result.Err({}).serialize(404, "not found") as ErrorResponseData<
          Record<never, never>
        >
      );
    }
    const form = await superValidate(
      { topic_id: topic.id },
      valibot(ANSWER_PAYLOAD)
    );
    type LoadDataResult = Result<
      {
        topic: typeof topic;
        form: SuperValidated<ANSWER_PAYLOAD>;
      },
      { form: SuperValidated<ANSWER_PAYLOAD> }
    >;
    if (topic.status === "ASKING_QUES") {
      return (
        Result.Ok({
          topic: {
            id: topic.id,
            name: topic.name,
            status: topic.status,
            questions: [],
          },
          form,
        }) as LoadDataResult
      ).serialize();
    }
    if (topic.status === "GETTING_ANS") {
      return (
        Result.Ok({
          topic,
          form,
        }) as LoadDataResult
      ).serialize();
    }
    if (topic.status === "GOT_ANS") {
      // todo
      return (Result.Err({ form }) as LoadDataResult).serialize(
        501,
        "not implemented"
      );
    }
  } catch (err) {
    // TODO: LOG
    if (isHttpError(err)) {
      throw err;
    }
    error(
      500,
      Result.Err({}).serialize(
        500,
        "internal dhon er error"
      ) as ErrorResponseData<Record<never, never>>
    );
  }
}

export const actions = {
  async answer({ request }) {
    const rec_data = await superValidate(request, valibot(ANSWER_PAYLOAD));
    if (!rec_data.valid) {
      return fail(
        400,
        Result.Err({ form: rec_data }).serialize(400, "invalid data")
      );
    }
    if (
      !rec_data.data["topic_id"] &&
      !(typeof rec_data.data["topic_id"] === "string")
    ) {
      return fail(
        400,
        Result.Err({ form: rec_data }).serialize(400, "invalid data")
      );
    }
    const topic_exists = await prisma.topic.count({
      where: {
        id: rec_data.data.topic_id as string,
      },
    });
    if (!topic_exists) {
      return fail(
        400,
        Result.Err({ form: rec_data }).serialize(400, "invalid data")
      );
    }
    const payload = rec_data.data;
    try {
      for (let [k, v] of Object.entries(payload) as Entries<typeof payload>) {
        if (k === "topic_id") {
          continue;
        }
        await prisma.question.update({
          where: {
            topic_id: payload.topic_id as string,
            id: k,
          },
          data: {
            answer: v.toString(),
          },
        });
      }
      const not_answered_ques = await prisma.question.count({
        where: {
          answer: {
            equals: null,
          },
          topic_id: payload.topic_id as string,
        },
      });

      if (not_answered_ques > 0) {
        return fail(
          400,
          Result.Err({ form: rec_data }).serialize(
            400,
            "you have some questions left to answer"
          )
        );
      } else {
        const { id: outline_id } = await prisma.outline.create({
          data: {
            status: "GENERATING",
            topic_id: payload.topic_id as string,
          },
        });
        await gen_outline_q.add(
          payload.topic_id as string,
          {
            topic_id: payload.topic_id as string,
            outline_id,
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
        await prisma.topic.update({
          where: {
            id: payload.topic_id as string,
          },
          data: {
            status: "GOT_ANS",
          },
        });
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2001" || err.code === "P2025") {
          return fail(
            400,
            Result.Err({ form: rec_data }).serialize(
              400,
              "some of the questions you tried to answer to are not valid"
            )
          );
        }
      }
      // TODO: Log
      console.error(err);
    }
  },
};
