import { Queue } from "bullmq";
import { inspect } from "util";
type GenOutlinePayload = {
  topic_id: string;
  outline_id: string;
};
export const gen_outline_q = new Queue<GenOutlinePayload, unknown, string>(
  "gen-outline",
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

gen_outline_q.on("error", (error) => {
  console.error(
    `error on creating outline queue: `,
    inspect(error, true, null)
  );
});
