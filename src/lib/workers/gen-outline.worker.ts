import config from "$lib/config";
import gemini from "$lib/ai/gemini.ai";
import { Worker } from "bullmq";
import prisma from "$lib/db.server";
import { inspect } from "node:util";
import Result from "$lib/utils/result/result.util";
import type { Content } from "@google/genai";
import {
  OUTLINE_OUTPUT_JSON_SCHEMA,
  OUTLINE_OUTPUT_SCHEMA,
} from "./schemas/OUTLINE_OUTPUT.schema";
import { safeParse } from "valibot";
type GenOutlinePayload = {
  topic_id: string;
  outline_id: string;
};

async function gen_history_and_get_topic_name(
  topic_id: string
): Promise<{ topic_name: string; history: Result<Content[], unknown> }> {
  const topic = await prisma.topic.findUnique({
    where: {
      id: topic_id,
    },
    select: {
      id: true,
      name: true,
      questions: {
        select: {
          id: true,
          title: true,
          answer: true,
        },
      },
    },
  });
  if (!topic) {
    return {
      topic_name: "",
      history: Result.Err(Error("invalid topic id, topic was not found")),
    };
  }
  const content: Content[] = [];
  content.push({
    parts: [
      {
        text: `${config.app.gen_ques_u_prompt} \n ${topic.name}`,
      },
    ],
    role: "user",
  });
  let gen_ques_resp = `${config.app.gen_ques_resp_meta} \n `;
  let user_ans_resp = ``;
  topic.questions.forEach((q, i) => {
    gen_ques_resp += `${i}. ${q.title} \n`;
    user_ans_resp += `${i} ${q.answer} \n`;
  });
  content.push({
    parts: [
      {
        text: gen_ques_resp,
      },
    ],
    role: "model",
  });
  content.push({
    parts: [
      {
        text: user_ans_resp,
      },
    ],
    role: "user",
  });

  return {
    topic_name: topic.name,
    history: Result.Ok(content),
  };
}
const outline_gen = new Worker<GenOutlinePayload, void, string>(
  "gen-outline",
  async (job) => {
    const history_and_name = await gen_history_and_get_topic_name(
      job.data.topic_id
    );
    // eslint-disable-next-line no-useless-catch
    try {
      const chat = gemini.chats.create({
        history: history_and_name.history.unwrap(),
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: config.app.gen_outline_sys_prompt,
          responseJsonSchema: OUTLINE_OUTPUT_JSON_SCHEMA,
          responseMimeType: "application/json",
        },
      });
      const outline_output = await chat.sendMessage({
        message: `${config.app.gen_outline_u_prompt} \n ${history_and_name.topic_name}`,
      });
      const outline = safeParse(
        OUTLINE_OUTPUT_SCHEMA,
        JSON.parse(outline_output.text || "")
      );
      if (outline.success) {
        for (const c of outline.output.chapters) {
          await prisma.outline.update({
            where: {
              id: job.data.outline_id,
            },
            data: {
              chapters: {
                create: {
                  name: c.name,
                  lessons: {
                    create: [...c.lessons],
                  },
                },
              },
            },
          });
        }
        await prisma.outline.update({
          where: {
            id: job.data.outline_id,
          },
          data: {
            status: "GENERATED",
          },
        });
      } else {
        throw new Error(
          "unexpected format of data received from gemini while generating outline"
        );
      }
    } catch (err) {
      throw err;
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

outline_gen.on("failed", async (job, err) => {
  // TODO: log the error
  await prisma.outline.update({
    where: {
      id: job?.data.outline_id,
    },
    data: {
      status: "FAILED",
    },
  });
  console.error(`job ${job?.id} failed: ${inspect(err, true, null, true)}`);
});

outline_gen.on("error", (err) => {
  // TODO: log the error
  console.error(
    `an error occurred while generating outline on the bull worker: ${inspect(
      err,
      true,
      null,
      true
    )}`
  );
});
