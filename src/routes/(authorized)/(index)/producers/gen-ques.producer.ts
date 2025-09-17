import { Queue } from "bullmq";
import { inspect } from "util";
import config from "$lib/config";
import Redis from "ioredis"
const connection = new Redis(config.redis.url ?? "");
type GenQuesPayload = {
  topic: string;
  for_topic: string;
};

export const gen_ques_q = new Queue<GenQuesPayload, unknown, string>(
  "gen-questions",
  {
    connection,
  }
);
gen_ques_q.on("error", (error) => {
  console.error(
    `error on creating question queue: `,
    inspect(error, true, null)
  );
});
