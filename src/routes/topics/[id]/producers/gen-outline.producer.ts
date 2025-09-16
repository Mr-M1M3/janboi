import { Queue } from "bullmq";
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
