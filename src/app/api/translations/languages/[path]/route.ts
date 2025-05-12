import translator from "@/utils/translator";

interface GetParams {
  path: string;
}

export async function GET(request: Request, { params }: { params: GetParams }) {
  const { path } = params;

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
