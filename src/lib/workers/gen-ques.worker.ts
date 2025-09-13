import { config } from "dotenv";
import gemini from "$lib/ai/gemini.ai";
import { Worker } from "bullmq";
import {
  QUES_OUTPUT_JSON_SCHEMA,
  type QUES_OUTPUT_FROM_AI,
} from "./schemas/QUES_OUTPUT.schema";
import prisma from "$lib/db.server";
config();
type GenQuesPayload = {
  topic: string;
  for_topic: string;
};
const ques_gen = new Worker<GenQuesPayload, void, string>(
  "gen-questions",
  async (job) => {
    try {
      console.log(job.data);
      const questions = await gemini.models.generateContent({
        contents: `${process.env.GEN_QUES_U_PROMPT} \n ${job.data.topic}`,
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: process.env.GEN_QUES_SYS_PROMPT,
          responseJsonSchema: QUES_OUTPUT_JSON_SCHEMA,
        },
      });
      const generated_questions = JSON.parse(
        questions.text || ""
      ) as QUES_OUTPUT_FROM_AI;
      for (const q of generated_questions.questions) {
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
    } catch (err) {
      // TODO: LOG
      console.error(`error:`, err);
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
