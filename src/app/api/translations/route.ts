import translator from "@/utils/translator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts, source, target } = body.data;

    const result = await translator.translateText(texts, source, target);

    return new Response(JSON.stringify(result));
  } catch (error) {
    console.error(Date.now(), "Error translating text:", error);
    return new Response("Something went wrong", { status: 500 });
  }
}
