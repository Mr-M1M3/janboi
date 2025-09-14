import { toJsonSchema } from "@valibot/to-json-schema";
import { object, string, array, type InferInput, strictObject } from "valibot";

export const OUTLINE_OUTPUT_SCHEMA = strictObject({
  chapters: array(
    object({
      name: string(),
      lessons: array(
        object({
          name: string(),
        })
      ),
    })
  ),
});

export const OUTLINE_OUTPUT_JSON_SCHEMA = toJsonSchema(OUTLINE_OUTPUT_SCHEMA);
export type OUTLINE_OUTPUT_FROM_AI = InferInput<typeof OUTLINE_OUTPUT_SCHEMA>;
