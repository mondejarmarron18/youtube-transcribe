import { google } from "googleapis";

export const getYoutubeVideosInfo = async (ids: string[], key: string) => {
  const res = await google.youtube("v3").videos.list({
    key,
    part: ["contentDetails", "snippet"],
    id: ids,
  });

  return res.data.items;
};

export const getYoutubeId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?=[^a-zA-Z0-9_-]|$)/;
  const match = url.match(regex);

  return match ? match[1] : null;
};
