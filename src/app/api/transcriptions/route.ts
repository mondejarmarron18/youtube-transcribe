import ai from "@/utils/ai";
import { isFreeTier } from "@/utils/tierValidator";
import apiLimiter from "@/middlwares/apiLimiter";
import { isoDurationToMs, timeToMs } from "@/utils/time";
import { getYoutubeVideosInfo } from "@/utils/youtube";
import youtubeToMp3, { YoutubeToMp3Return } from "@/utils/youtubeToMp3";
import axios from "axios";
import { toFile } from "openai";

const ALLOWED_VIDEO_LENGTH = timeToMs.mins(10);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body.data;
    const youtubeId = youtubeUrl.split("v=")[1];

    if (!youtubeId) {
      throw new Error("Failed to get youtube info");
    }

    if (!GOOGLE_API_KEY) {
      console.log("GOOGLE_API_KEY not found");
      throw new Error("Failed to connect to youtube");
    }

    const ytVidsInfo = await getYoutubeVideosInfo([youtubeId], GOOGLE_API_KEY);
    const duration = ytVidsInfo?.[0].contentDetails?.duration;
    const durationInMs = duration ? isoDurationToMs(duration) : null;

    if (!durationInMs) {
      throw new Error("Failed to connect to youtube");
    }

    if (isFreeTier) {
      validateVideoLength(durationInMs, ALLOWED_VIDEO_LENGTH);
    }

    const { link }: YoutubeToMp3Return = await new Promise(
      async (resolve, reject) => {
        let youtubeAudio = await youtubeToMp3(youtubeId);

        console.log(youtubeAudio);
        const poll = async () => {
          if (youtubeAudio.status === "fail") {
            return reject(youtubeAudio);
          }

          if (youtubeAudio.status === "ok") {
            return resolve(youtubeAudio);
          }

          youtubeAudio = await youtubeToMp3(youtubeId);
          setTimeout(poll, 3000);
        };

        poll();
      }
    );

    console.log(link);

    const audio = await axios.get(link, {
      responseType: "stream",
    });

    console.log("stream");

    if (!audio.data) {
      throw new Error("Failed to get youtube audio");
    }

    const file = await toFile(audio.data, "audio.mp3");

    console.log(file);

    return apiLimiter(request, 2, timeToMs.days(1), async () => {
      const transcript = await ai.openai.audio.transcriptions.create({
        model: "gpt-4o-mini-transcribe",
        file,
      });

      console.log(transcript);
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
            content: transcript.text,
          },
        ],
      });

      return new Response(formattedTranscript.choices[0].message.content);
    });
  } catch (error) {
    console.log("Error transcribing video:" + error);

    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(JSON.stringify(error));
  }
}

const validateVideoLength = (
  videoLengthMs: number,
  allowedVideoLengthMs: number
) => {
  if (videoLengthMs < allowedVideoLengthMs) return;

  const timeInMins = Math.floor(allowedVideoLengthMs / 60000);

  throw new Error(
    `We are providing limited access at the moment, so we only allow transcripting videos under ${timeInMins} minutes.`
  );
};
