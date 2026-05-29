import { promises as fs } from "fs";
import path from "path";

/**
 * Voz padrão do painel — persistida no servidor (arquivo), então vale para
 * TODAS as telas (inclusive a TV), e é definida pelas configurações da UI, não
 * mais por variável de ambiente. Fallback: GOOGLE_TTS_VOICE (se existir) ou
 * uma voz Chirp 3 HD feminina.
 */
const CONFIG_FILE = path.join(process.cwd(), ".voice-config.json");
const FALLBACK_VOICE =
  process.env.GOOGLE_TTS_VOICE || "pt-BR-Chirp3-HD-Aoede";

const VOICE_PATTERN = /^pt-BR-[A-Za-z0-9-]+$/;

export function isValidVoice(voice: string): boolean {
  return VOICE_PATTERN.test(voice);
}

export async function getDefaultVoice(): Promise<string> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf8");
    const data = JSON.parse(raw) as { voice?: unknown };
    if (typeof data.voice === "string" && isValidVoice(data.voice)) {
      return data.voice;
    }
  } catch {
    // arquivo ainda não existe / inválido — usa o fallback
  }
  return FALLBACK_VOICE;
}

export async function setDefaultVoice(voice: string): Promise<void> {
  if (!isValidVoice(voice)) throw new Error("Voz inválida");
  await fs.writeFile(CONFIG_FILE, JSON.stringify({ voice }), "utf8");
}
