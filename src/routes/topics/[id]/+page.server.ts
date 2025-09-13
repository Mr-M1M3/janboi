import prisma from "$lib/db.server.js";
import type { ErrorResponseData } from "$lib/types/ResponseData.type.js";
import Result from "$lib/utils/result/result.util.js";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  // if the job already
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
      return error(
        404,
        Result.Err({}).serialize(404, "not found") as ErrorResponseData<
          Record<never, never>
        >
      );
    }
    if (topic.status === "ASKING_QUES") {
      return Result.Ok({
        id: topic.id,
        name: topic.name,
        status: topic.status,
      }).serialize();
    }
    if (topic.status === "GETTING_ANS") {
      return Result.Ok(topic).serialize();
    }
    if (topic.status === "GOT_ANS") {
      // todo
      return Result.Err({}).serialize(501, "not implemented");
    }
  } catch (err) {
    error(
      500,
      Result.Err({}).serialize(500, "internal error") as ErrorResponseData<
        Record<never, never>
      >
    );
  }
}
