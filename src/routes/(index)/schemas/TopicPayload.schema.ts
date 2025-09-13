import { object, pipe, string, minLength, maxLength } from "valibot";

export const TOPIC_PAYLOAD = object({
  topic: pipe(
    string(),
    minLength(3, "cannot be less than 3 characters"),
    maxLength(128, "cannot be more than 128 characters")
  ),
});
