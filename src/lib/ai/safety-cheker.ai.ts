import gemini from "./gemini.ai";
import { SAFETY_CHECK_PROMPT } from "$env/static/private";
export default async function is_the_prompt_safe(prompt: string) {
  return true;
  const safety_check_result = await gemini.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `${SAFETY_CHECK_PROMPT} \n TOPIC: \n ${prompt}`,
  });
  if (safety_check_result.text?.toLowerCase() === "unsafe") {
    return false;
  } else if (safety_check_result.text?.toLowerCase() === "safe") {
    return true;
  } else {
    console.log(`safety check result ${safety_check_result.text}`);
    throw Error(
      "gemini provided unexpected output while checking thr prompt safety."
    );
  }
}
