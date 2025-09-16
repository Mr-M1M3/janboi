import { toJsonSchema } from "@valibot/to-json-schema";
import { strictObject, string, type InferInput } from "valibot";

export const LESSON_OUTPUT_SCHEMA = strictObject({
  content: string(),
});

export const LESSON_OUTPUT_JSON_SCHEMA = toJsonSchema(LESSON_OUTPUT_SCHEMA);
export type LessonOutput = InferInput<typeof LESSON_OUTPUT_SCHEMA>;
