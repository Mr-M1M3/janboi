import type { BetterAuthClientPlugin } from "better-auth";
import { topic_plugin } from "./topic.plugin";

export const birthdayClientPlugin = () => {
  return {
    id: "topic_plugin",
    $InferServerPlugin: {} as ReturnType<typeof topic_plugin>,
  } satisfies BetterAuthClientPlugin;
};
