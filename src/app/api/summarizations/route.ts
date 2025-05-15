import apiLimiter from "@/middlwares/apiLimiter";
import ai from "@/utils/ai";
import { timeToMs } from "@/utils/time";

const ALLOWED_CHARACTERS_LENGTH = 5000;

const validateCharactersLength = (
  texts: string | string[],
  allowedCharactersLength: number
) => {
  const textsLength = Array.isArray(texts)
    ? texts.join("").length
    : texts.length;

  if (textsLength <= allowedCharactersLength) return;

  throw new Error(
    `We are providing limited access at the moment, so we only allow ${allowedCharactersLength} characters to summarize.`
  );
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body.data;

    validateCharactersLength(text, ALLOWED_CHARACTERS_LENGTH);

    return apiLimiter(request, 2, timeToMs.days(1), async () => {
      const response = await ai.deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Summarize the following text by highlighting the key points and removing unnecessary details. Provide only the summarized text without any additional commentary or explanation. Respond only with the summarized text.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      const content = response.choices[0].message.content;

      return new Response(content);
    });
  } catch (error) {
    console.error("Error summarizing text:", error);

    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Something went wrong", { status: 500 });
  }
}
