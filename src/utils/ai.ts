import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ai = {
  deepseek,
  openai,
} as const;

export default ai;
