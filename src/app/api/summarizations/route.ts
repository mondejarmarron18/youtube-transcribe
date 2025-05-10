import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL,
});

export async function POST(request: Request) {
  try {
    console.log(process.env.DEEPSEEK_BASE_URL);
    const body = await request.json();
    const { text } = body.data;

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Summarize the following text. Respond only with the summarized text.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    return new Response(response.choices[0].message.content);
  } catch (error) {
    console.error(Date.now(), "Error summarizing text:", error);
    return new Response("Something went wrong", { status: 500 });
  }
}
