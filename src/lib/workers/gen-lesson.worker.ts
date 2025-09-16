import config from "$lib/config";
import gemini from "$lib/ai/gemini.ai";
import { Worker } from "bullmq";
import prisma from "$lib/db.server";
import { inspect } from "node:util";
import Result from "$lib/utils/result/result.util";
import type { Content } from "@google/genai";
import {
  LESSON_OUTPUT_JSON_SCHEMA,
  LESSON_OUTPUT_SCHEMA,
} from "./schemas/LESSON_OUTPUT.schema";
import { safeParse } from "valibot";
type GenLessonPayload = {
  topic_id: string;
  lesson_id: string;
};

async function gen_history_and_get_lesson_name(
  topic_id: string,
  lesson_id: string
): Promise<{ lesson_name: string; history: Result<Content[], unknown> }> {
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
      outline: {
        select: {
          id: true,
          chapters: {
            select: {
              id: true,
              name: true,
              lessons: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!topic) {
    return {
      lesson_name: "",
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
  let gen_outline_resp = `${config.app.gen_outline_resp_meta} \n `;
  topic.questions.forEach((q, i) => {
    gen_ques_resp += `${i}. ${q.title} \n`;
    user_ans_resp += `${i} ${q.answer} \n`;
  });
  topic.outline?.chapters.forEach((chapter, c_i) => {
    gen_outline_resp += `# Chapter ${c_i}: ${chapter.name} \n       `;
    chapter.lessons.forEach((lesson, l_i) => {
      gen_outline_resp += `## Lesson ${l_i}: ${lesson.name} \n       `;
    });
    gen_outline_resp += `\n`;
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

  content.push({
    parts: [
      {
        text: gen_outline_resp,
      },
    ],
    role: "model",
  });
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lesson_id,
    },
    select: {
      name: true,
    },
  });
  return {
    lesson_name: lesson?.name || "",
    history: Result.Ok(content),
  };
}

const lesson_gen = new Worker<GenLessonPayload, void, string>(
  "gen-lesson",
  async (job) => {
    const history_and_lesson_name = await gen_history_and_get_lesson_name(
      job.data.topic_id,
      job.data.lesson_id
    );
    // eslint-disable-next-line no-useless-catch
    try {
      const chat = gemini.chats.create({
        history: history_and_lesson_name.history.unwrap(),
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: config.app.gen_lesson_sys_prompt,
          responseJsonSchema: LESSON_OUTPUT_JSON_SCHEMA,
          responseMimeType: "application/json",
        },
      });
      let message_from_ai = "";
      const lesson_output = await chat.sendMessageStream({
        message: `${config.app.gen_lesson_u_prompt} \n ${history_and_lesson_name.lesson_name}`,
      });
      for await (const chunk of lesson_output) {
        message_from_ai += chunk.text;
      }

      const lesson = safeParse(
        LESSON_OUTPUT_SCHEMA,
        JSON.parse(message_from_ai || "")
      );
      if (lesson.success) {
        await prisma.lesson.update({
          where: {
            id: job.data.lesson_id,
          },
          data: {
            status: "GENERATED",
            content: lesson.output.content,
          },
        });
      } else {
        throw new Error(
          "unexpected format of data received from gemini while generating lessson"
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

lesson_gen.on("failed", async (job, err) => {
  // TODO: log the error
  await prisma.lesson.update({
    where: {
      id: job?.data.lesson_id,
    },
    data: {
      status: "FAILED",
    },
  });
  console.error(`job ${job?.id} failed: ${inspect(err, true, null, true)}`);
});

lesson_gen.on("error", (err) => {
  // TODO: log the error
  console.error(
    `an error occurred while generating lesson on the bull worker: ${inspect(
      err,
      true,
      null,
      true
    )}`
  );
});
