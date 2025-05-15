import { google } from "googleapis";

export const getYoutubeVideosInfo = async (ids: string[], key: string) => {
  const res = await google.youtube("v3").videos.list({
    key,
    part: ["contentDetails", "snippet"],
    id: ids,
  });

  return res.data.items;
};
