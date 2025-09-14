import { record, string, union, number, type InferInput } from "valibot";

export const ANSWER_PAYLOAD = record(string(), union([number(), string()]));

export type ANSWER_PAYLOAD = InferInput<typeof ANSWER_PAYLOAD>;
