import prisma from "$lib/db.server.js";
import type { ErrorResponseData } from "$lib/types/ResponseData.type.js";
import Result from "$lib/utils/result/result.util.js";
import { error, fail, isHttpError } from "@sveltejs/kit";
import { superValidate, type SuperValidated } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { ANSWER_PAYLOAD } from "./schemas/AnswersPayload.schema.js";
import type { Entries } from "$lib/types/Entries.type.js";
import { PrismaClientKnownRequestError } from "$lib/generated/prisma/internal/prismaNamespace.js";
import { gen_outline_q } from "./producers/gen-outline.producer.js";
export async function load({ params, depends }) {
  // if the job already done
  depends("topic-state");
  depends("outline-state");
  try {
    const topic = await prisma.topic.findUnique({
      where: {
        id: params.id,
      },
      select: {
        status: true,
        id: true,
        name: true,
        meta: true,
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
        outline: {
          select: {
            status: true,
            id: true,
            chapters: {
              select: {
                id: true,
                name: true,
                lessons: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                },
              },
            },
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
    if (topic.status === "GENERATING_QUES") {
      return (
        Result.Ok({
          topic: {
            id: topic.id,
            name: topic.name,
            status: topic.status,
            questions: [],
            outline: null,
            meta: topic.meta,
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
      if (topic.outline?.status === "GENERATING") {
        return (
          Result.Ok({
            form,
            topic: {
              id: topic.id,
              name: topic.name,
              status: topic.status,
              meta: topic.meta,
              questions: [],
              outline: {
                id: topic.outline.id,
                status: topic.outline?.status,
                chapters: [],
              },
            },
          }) as LoadDataResult
        ).serialize();
      } else {
        return (
          Result.Ok({
            form,
            topic: {
              id: topic.id,
              name: topic.name,
              meta: topic.meta,
              status: topic.status,
              questions: [],
              outline: topic.outline,
            },
          }) as LoadDataResult
        ).serialize();
      }
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
        Result.Err({ form: rec_data }).serialize(400, "invalid data", rec_data)
      );
    }
    if (
      !rec_data.data["topic_id"] &&
      !(typeof rec_data.data["topic_id"] === "string")
    ) {
      return fail(
        400,
        Result.Err({ form: rec_data }).serialize(400, "invalid data", rec_data)
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
        Result.Err({ form: rec_data }).serialize(400, "invalid data", rec_data)
      );
    }
    const payload = rec_data.data;
    try {
      for (const [k, v] of Object.entries(payload) as Entries<typeof payload>) {
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
            "you have some questions left to answer",
            rec_data
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
        const updated = await prisma.topic.update({
          where: {
            id: payload.topic_id as string,
          },
          data: {
            status: "GOT_ANS",
          },
          select: {
            id: true,
            name: true,
            status: true,
            meta: true,
          },
        });
        return Result.Ok(updated).serialize(
          200,
          "your outline is being generated",
          rec_data
        );
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2001" || err.code === "P2025") {
          return fail(
            400,
            Result.Err({ form: rec_data }).serialize(
              400,
              "some of the questions you tried to answer to are not valid",
              rec_data
            )
          );
        }
      }
      // TODO: Log
      console.error(err);
    }
  },
};
