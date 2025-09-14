import { config } from "dotenv";
import gemini from "$lib/ai/gemini.ai";
import { Worker } from "bullmq";
import {
  QUES_OUTPUT_JSON_SCHEMA,
  QUES_OUTPUT_SCHEMA,
} from "./schemas/QUES_OUTPUT.schema";
import prisma from "$lib/db.server";
import { inspect } from "node:util";
import { safeParse } from "valibot";
config();
type GenQuesPayload = {
  topic: string;
  for_topic: string;
};
const ques_gen = new Worker<GenQuesPayload, void, string>(
  "gen-questions",
  async (job) => {
    try {
      const questions = await gemini.models.generateContent({
        contents: `${process.env.GEN_QUES_U_PROMPT} \n ${job.data.topic}`,
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: process.env.GEN_QUES_SYS_PROMPT,
          responseJsonSchema: QUES_OUTPUT_JSON_SCHEMA,
          responseMimeType: "application/json",
        },
      });
      const generated_questions = safeParse(
        QUES_OUTPUT_SCHEMA,
        JSON.parse(questions.text || "")
      );
      if (generated_questions.success) {
        for (const q of generated_questions.output.questions) {
          await prisma.question.create({
            data: {
              title: q.title,
              topic_id: job.data.for_topic,
              options: {
                createMany: {
                  data: q.options_or_suggestions.map((opt_sugg) => {
                    return {
                      content: opt_sugg,
                    };
                  }),
                },
              },
            },
          });
        }
        await prisma.topic.update({
          where: {
            id: job.data.for_topic,
          },
          data: {
            status: "GETTING_ANS",
          },
        });
      } else {
        throw new Error(
          "unexpected format of data received from gemini while generating questions"
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

ques_gen.on("failed", (job, err) => {
  // TODO: log the error
  console.error(`job ${job?.id} failed: ${inspect(err, true, null, true)}`);
});

ques_gen.on("error", (err) => {
  // TODO: log the error
  console.error(
    `an error occurred while on the bull worker: ${inspect(
      err,
      true,
      null,
      true
    )}`
  );
});
