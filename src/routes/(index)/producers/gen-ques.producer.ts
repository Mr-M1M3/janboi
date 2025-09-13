import { Queue } from "bullmq";
import type { QUES_OUTPUT_FROM_AI } from "../schemas/QUES_OUTPUT.schema";
// import {} from "ioredis";

type GenQuesPayload = {
  prompt: string;
  for_topic: string;
};
type GenQuesResultType = QUES_OUTPUT_FROM_AI;
export const gen_ques_q = new Queue<GenQuesPayload, GenQuesResultType, string>(
  "gen-questions",
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
