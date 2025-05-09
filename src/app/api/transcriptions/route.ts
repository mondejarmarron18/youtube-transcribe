import ytdl from "@distube/ytdl-core";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body.data;

    // const fileStream = createWriteStream("./audio.mp4");

    // await new Promise((resolve, reject) => {
    //   ytdl(youtubeUrl, { filter: "videoandaudio", quality: "highestaudio" })
    //     .pipe(fileStream)
    //     .on("finish", () => resolve(true))
    //     .on("error", reject);
    // });

    const audioStream = ytdl(youtubeUrl, {
      filter: "audioandvideo",
      quality: "highestaudio",
    });

    const audioBuffer = await streamToBuffer(audioStream);
    const fileLike = bufferToFileLike(audioBuffer, "audio.mp4");

    const transcription = await client.audio.transcriptions.create({
      file: fileLike,
      model: "whisper-1",
    });

    return new Response(transcription.text);
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error));
  }
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function bufferToFileLike(buffer: Buffer, filename: string): File {
  return new File([buffer], filename, {
    type: "audio/mp4",
    lastModified: Date.now(),
  });
}
