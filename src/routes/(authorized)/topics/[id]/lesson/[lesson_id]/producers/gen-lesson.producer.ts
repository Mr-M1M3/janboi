import { Queue } from "bullmq";
import { inspect } from "util";
type GenLessonPayload = {
  topic_id: string;
  lesson_id: string;
};
export const gen_lesson_q = new Queue<GenLessonPayload, unknown, string>(
  "gen-lesson",
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
gen_lesson_q.on("error", (error) => {
  console.error(
    `error on creating outline queue: `,
    inspect(error, true, null)
  );
});
