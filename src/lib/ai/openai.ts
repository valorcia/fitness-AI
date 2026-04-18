import OpenAI from "openai";
import { env } from "../env";

export const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export const models = {
  coach: env.OPENAI_MODEL_COACH,
  tts: env.OPENAI_MODEL_TTS,
  stt: env.OPENAI_MODEL_STT,
};
