import apiLimiter from "@/middlwares/apiLimiter";
import { timeToMs } from "@/utils/time";
import translator from "@/utils/translator";

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
    `We are providing limited access at the moment, so we only allow ${allowedCharactersLength} characters to translate.`
  );
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts, source, target } = body.data;

    validateCharactersLength(texts, ALLOWED_CHARACTERS_LENGTH);

    return apiLimiter(request, 2, timeToMs.days(1), async () => {
      const result = await translator.translateText(texts, source, target);

      return new Response(JSON.stringify(result));
    });
  } catch (error) {
    console.error("Error translating text:", error);

    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Something went wrong", { status: 500 });
  }
}
