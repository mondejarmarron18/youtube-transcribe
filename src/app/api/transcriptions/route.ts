import ytdl from "@distube/ytdl-core";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";
import ai from "@/utils/ai";
import { isFreeTier } from "@/utils/tierValidator";
import apiLimiter from "@/middlwares/apiLimiter";
import timeToMs from "@/utils/timeToMs";

const xmlParser = new XMLParser();
const ALLOWED_VIDEO_LENGTH = timeToMs.mins(10);

const validateVideoLength = (
  videoLength: number,
  allowedVideoLength: number
) => {
  if (videoLength < allowedVideoLength) return;

  throw new Error(
    `We are providing limited access at the moment, so we only allow transcripting videos under ${allowedVideoLength} minutes.`
  );
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body.data;
    const ytInfo = await ytdl.getInfo(youtubeUrl);

    if (isFreeTier) {
      const lengthSeconds = ytInfo.videoDetails.lengthSeconds;
      const duration = parseInt(lengthSeconds, 10) * 1000;

      validateVideoLength(duration, ALLOWED_VIDEO_LENGTH);
    }

    return apiLimiter(request, 2, timeToMs.days(1), async () => {
      const tracks =
        ytInfo.player_response.captions?.playerCaptionsTracklistRenderer
          .captionTracks;

      const baseURL = tracks?.find(
        (track) => track.languageCode === "en"
      )?.baseUrl;

      if (!baseURL) {
        throw new Error("No english captions found to transcribe");
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
    });
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
    console.log("Error transcribing video:" + error);

    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }

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
