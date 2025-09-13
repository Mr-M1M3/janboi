import gemini from "./gemini.ai";
import { SAFETY_CHECK_PROMPT } from "$env/static/private";
export default async function is_the_prompt_safe(prmpt: string) {
  const safety_check_result = await gemini.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `${SAFETY_CHECK_PROMPT} \n TOPIC: \n ${prompt}`,
  });
  if (safety_check_result.text === "unsafe") {
    return false;
  }
  if (safety_check_result.text == "safe") {
    return true;
  } else {
    throw Error(
      "gemini provided unexpected output while checking thr prompt safety."
    );
  }
}
