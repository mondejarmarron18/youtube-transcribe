import ytdl from "@distube/ytdl-core";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";
import ai from "@/utils/ai";

const xmlParser = new XMLParser();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body.data;

    const ytInfo = await ytdl.getInfo(youtubeUrl);
    const tracks =
      ytInfo.player_response.captions?.playerCaptionsTracklistRenderer
        .captionTracks;

    const baseURL = tracks?.find(
      (track) => track.languageCode === "en"
    )?.baseUrl;

    if (!baseURL) {
      throw new Error("No captions found for this video");
    }

    const response = await axios.get(baseURL);
    const xml = xmlParser.parse(response.data);

    const transcript = xml.transcript.text;

    const formattedTranscript = await ai.openai.chat.completions.create({
      model: "o4-mini",
      messages: [
        {
          role: "system",
          content:
            "Rewrite the following transcript to reflect a natural conversational tone. Add appropriate punctuation, pauses, and emotion to make it feel like how a person would speak aloud. Add paragraph breaks and emphasis where needed to make the speech flow naturally.",
        },
        {
          role: "user",
          content: transcript.join(""),
        },
      ],
    });

    return new Response(formattedTranscript.choices[0].message.content);
    // const audioStream = ytdl(youtubeUrl, {
    //   filter: "audioandvideo",
    //   quality: "lowestvideo",
    // });

    // const audioBuffer = await streamToBuffer(audioStream);
    // const fileLike = bufferToFileLike(audioBuffer, "audio.mp4");

    // const transcription = await openai.audio.transcriptions.create({
    //   file: fileLike,
    //   model: "gpt-4o-mini-transcribe",
    // });

    // const formattedTranscript = await openai.chat.completions.create({
    //   model: "o4-mini",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "Rewrite the following transcript to reflect a natural conversational tone. Add appropriate punctuation, pauses, and emotion to make it feel like how a person would speak aloud. Add paragraph breaks and emphasis where needed to make the speech flow naturally.",
    //     },
    //     {
    //       role: "user",
    //       content: transcription.text,
    //     },
    //   ],
    // });

    // const content = formattedTranscript.choices[0].message.content;

    // return new Response(content);
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error));
  }
}

// function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const chunks: Buffer[] = [];
//     stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
//     stream.on("end", () => resolve(Buffer.concat(chunks)));
//     stream.on("error", reject);
//   });
// }

// function bufferToFileLike(buffer: Buffer, filename: string): File {
//   return new File([buffer], filename, {
//     type: "audio/mp4",
//     lastModified: Date.now(),
//   });
// }
