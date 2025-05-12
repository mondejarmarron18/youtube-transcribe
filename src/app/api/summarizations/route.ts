import ai from "@/utils/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body.data;

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
  } catch (error) {
    console.error(Date.now(), "Error summarizing text:", error);
    return new Response("Something went wrong", { status: 500 });
  }
}
