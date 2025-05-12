import translator from "@/utils/translator";

interface Context {
  params: Promise<{
    path: string;
  }>;
}

export async function GET(request: Request, context: Context) {
  const { path } = await context.params;

  let result;

  switch (path) {
    case "target":
      result = await translator.getTargetLanguages();
      break;
    case "source":
      result = await translator.getSourceLanguages();
      break;
    default:
      return new Response("Invalid path", { status: 400 });
  }

  return new Response(JSON.stringify(result));
}
