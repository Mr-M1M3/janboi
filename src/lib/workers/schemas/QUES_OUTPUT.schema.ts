import { toJsonSchema } from "@valibot/to-json-schema";
import {
  object,
  pipe,
  string,
  array,
  picklist,
  maxLength,
  type InferInput,
  strictObject,
} from "valibot";

export const QUES_OUTPUT_SCHEMA = strictObject({
  meta: pipe(string(), maxLength(256)),
  questions: array(
    object({
      title: string(),
      type: array(string()),
      options_or_suggestions: array(string()),
    })
  ),
});

export const QUES_OUTPUT_JSON_SCHEMA = toJsonSchema(QUES_OUTPUT_SCHEMA);
export type QUES_OUTPUT_FROM_AI = InferInput<typeof QUES_OUTPUT_SCHEMA>;
