import { Queue } from "bullmq";
import { inspect } from "util";
import config from "$lib/config";
type GenLessonPayload = {
  topic_id: string;
  lesson_id: string;
};

import Redis from "ioredis"
const connection = new Redis(config.redis.url ?? "");

export const gen_lesson_q = new Queue<GenLessonPayload, unknown, string>(
  "gen-lesson",
  {
    connection
  }
);
gen_lesson_q.on("error", (error) => {
  console.error(
    `error on creating outline queue: `,
    inspect(error, true, null)
  );
});
