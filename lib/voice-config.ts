import { promises as fs } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), ".voice-config.json");
const VOICE_PATTERN = /^pt-BR-[A-Za-z0-9-]+$/;

export const FREE_VOICE = "free";

export function hasGoogleKey(): boolean {
  return !!process.env.GOOGLE_TTS_API_KEY;
}

export function isValidVoice(voice: string): boolean {
  return voice === FREE_VOICE || VOICE_PATTERN.test(voice);
}

export async function getDefaultVoice(): Promise<string> {
  if (!hasGoogleKey()) return FREE_VOICE;
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf8");
    const data = JSON.parse(raw) as { voice?: unknown };
    if (typeof data.voice === "string" && isValidVoice(data.voice)) {
      return data.voice;
    }
  } catch {
  }
  return process.env.GOOGLE_TTS_VOICE || "pt-BR-Chirp3-HD-Aoede";
}

export async function setDefaultVoice(voice: string): Promise<void> {
  if (!isValidVoice(voice)) throw new Error("Voz inválida");
  await fs.writeFile(CONFIG_FILE, JSON.stringify({ voice }), "utf8");
}
