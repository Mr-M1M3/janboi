import prisma from "$lib/db.server.js";
import Result from "$lib/utils/result/result.util.js";
import { isRedirect, redirect } from "@sveltejs/kit";
import { gen_ques_q } from "../../(index)/producers/gen-ques.producer.js";
import { error } from "console";
import { NotFound } from "$lib/utils/errors/notfound.util.js";
import { ServerError } from "$lib/utils/errors/server-error.util.js";

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
      return error(404, new NotFound().serilaize());
    }
    if (topic.status === "ASKING_QUES") {
      return Result.Ok({
        id: topic.id,
        name: topic.name,
        status: topic.status,
      }).transform((from) => from.unwrap());
    }
    if (topic.status === "GETTING_ANS") {
      return Result.Ok(topic).transform((from) => from.unwrap());
    }
    if (topic.status === "GOT_ANS") {
      // todo
      return Result.Err("not implemented").transform((from) => from.unwrap());
    }
  } catch (err) {
    if (isRedirect(err)) {
      throw err;
    }
    error(500, new ServerError(500, "internal error", {}));
  }
}
