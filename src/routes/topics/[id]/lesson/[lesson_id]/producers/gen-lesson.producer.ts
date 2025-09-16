import { Queue } from "bullmq";
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
