import axios from "axios";

export interface YoutubeToMp3Return {
  link: string;
  msg: string;
  status: "ok" | "processing" | "fail";
}

const ytMp3 = {
  url: process.env.YT_MP36_API_URL,
  key: process.env.YT_MP36_API_KEY,
  host: process.env.YT_MP36_API_HOST,
};

const youtubeToMp3 = async (youtubeId: string): Promise<YoutubeToMp3Return> => {
  if (!ytMp3.url || !ytMp3.key || !ytMp3.host) {
    throw new Error("Youtube to MP3 API is not configured correctly");
  }

  const response = await axios.get(ytMp3.url, {
    params: {
      id: youtubeId,
    },
    headers: {
      "x-rapidapi-host": ytMp3.host,
      "x-rapidapi-key": ytMp3.key,
    },
  });

  return response.data;
};

export default youtubeToMp3;
