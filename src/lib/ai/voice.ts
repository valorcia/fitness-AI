import { openai, models } from "./openai";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export type VoiceProvider = "openai" | "elevenlabs";

export type TTSParams = {
  text: string;
  provider?: VoiceProvider;
  openaiVoice?: string;                // alloy | echo | shimmer | fable | onyx | nova
  elevenLabsVoiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;                      // 0..1 (ElevenLabs)
  emotion?: "motivational" | "supportive" | "analytic" | "celebratory" | "corrective" | "checkin";
};

export async function synthesize(params: TTSParams): Promise<ReadableStream<Uint8Array>> {
  const provider =
    params.provider ??
    (ELEVENLABS_API_KEY && params.elevenLabsVoiceId ? "elevenlabs" : "openai");

  if (provider === "elevenlabs" && ELEVENLABS_API_KEY && params.elevenLabsVoiceId) {
    return elevenLabsStream(params.text, {
      voiceId: params.elevenLabsVoiceId,
      stability: params.stability ?? 0.55,
      similarityBoost: params.similarityBoost ?? 0.85,
      style: params.style ?? emotionToStyle(params.emotion),
    });
  }

  return openaiTtsStream(params.text, params.openaiVoice ?? "nova");
}

async function openaiTtsStream(
  text: string,
  voice: string,
): Promise<ReadableStream<Uint8Array>> {
  if (!openai) throw new Error("OpenAI non configuré");
  const res = await openai.audio.speech.create({
    model: models.tts,
    voice: voice as "alloy" | "echo" | "shimmer" | "fable" | "onyx" | "nova",
    input: text,
    response_format: "mp3",
  });
  return res.body as ReadableStream<Uint8Array>;
}

async function elevenLabsStream(
  text: string,
  params: { voiceId: string; stability: number; similarityBoost: number; style: number },
): Promise<ReadableStream<Uint8Array>> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${params.voiceId}/stream?optimize_streaming_latency=2&output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: params.stability,
        similarity_boost: params.similarityBoost,
        style: params.style,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "ElevenLabs error");
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${errText}`);
  }
  return res.body;
}

function emotionToStyle(e?: TTSParams["emotion"]): number {
  switch (e) {
    case "motivational":
      return 0.7;
    case "celebratory":
      return 0.85;
    case "corrective":
      return 0.45;
    case "analytic":
      return 0.2;
    case "supportive":
      return 0.5;
    case "checkin":
    default:
      return 0.35;
  }
}

export async function transcribeAudio(file: File): Promise<string> {
  if (!openai) throw new Error("OpenAI non configuré");
  const res = await openai.audio.transcriptions.create({
    model: models.stt,
    file,
    language: "fr",
    response_format: "text",
    temperature: 0,
  });
  return typeof res === "string" ? res : (res as { text: string }).text;
}
