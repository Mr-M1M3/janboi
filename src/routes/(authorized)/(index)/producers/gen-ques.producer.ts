import { Queue } from "bullmq";
import { inspect } from "util";
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
gen_ques_q.on("error", (error) => {
  console.error(
    `error on creating outline queue: `,
    inspect(error, true, null)
  );
});
