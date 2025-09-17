import gemini from "./gemini.ai";
import config from "$lib/config";
export default async function is_the_prompt_safe(prompt: string) {
  const safety_check_result = await gemini.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `${config.app.safety_check_prompt} \n TOPIC: \n ${prompt}`,
  });
  if (safety_check_result.text?.toLowerCase() === "unsafe") {
    return false;
  } else if (safety_check_result.text?.toLowerCase() === "safe") {
    return true;
  } else {
    console.error(`safety check result ${safety_check_result.text}`);
    throw Error(
      "gemini provided unexpected output while checking thr prompt safety."
    );
  }
}
