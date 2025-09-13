import { Queue } from "bullmq";
type GenQuesPayload = {
  topic: string;
  for_topic: string;
};
export const gen_ques_q = new Queue<GenQuesPayload, unknown, string>(
  "gen-questions",
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
