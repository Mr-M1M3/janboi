import { Queue } from "bullmq";
import { inspect } from "util";
import config from "$lib/config";
import Redis from "ioredis"
const connection = new Redis(config.redis.url ?? "");
type GenOutlinePayload = {
  topic_id: string;
  outline_id: string;
};
export const gen_outline_q = new Queue<GenOutlinePayload, unknown, string>(
  "gen-outline",
  {
    connection
  }
);

gen_outline_q.on("error", (error) => {
  console.error(
    `error on creating outline queue: `,
    inspect(error, true, null)
  );
});
