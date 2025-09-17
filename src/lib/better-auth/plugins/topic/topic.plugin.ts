import type { BetterAuthPlugin } from "better-auth";

export const topic_plugin = () => {
  return {
    id: "topic_plugin",
    schema: {
      //   user: {
      //     fields: {
      //       topics: {
      //         type: "string[]",
      //         required: false,
      //         references: {
      //           model: "topic",
      //           field: "id",
      //           onDelete: "no action",
      //         },
      //         fieldName: "topics",
      //       },
      //     },
      //   },
      topic: {
        fields: {
          user_id: {
            type: "string",
            required: true,
            references: {
              model: "user",
              field: "id",
              onDelete: "cascade",
            },
          },
        },
        modelName: "topic",
      },
    },
  } satisfies BetterAuthPlugin;
};
