import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_TTS_API_KEY;

interface GoogleVoice {
  name: string;
  ssmlGender?: string;
  languageCodes?: string[];
}

interface VoiceItem {
  name: string;
  gender: string;
  type: string;
}

// Ordena por qualidade (melhores tipos primeiro) e depois por nome.
const TYPE_RANK: Record<string, number> = {
  "Chirp 3 HD": 0,
  Studio: 1,
  Neural2: 2,
  "Chirp HD": 3,
  WaveNet: 4,
  Polyglot: 5,
  Standard: 6,
  Outro: 7,
};

function voiceType(name: string): string {
  if (name.includes("Chirp3-HD") || name.includes("Chirp3")) return "Chirp 3 HD";
  if (name.includes("Chirp-HD") || name.includes("Chirp")) return "Chirp HD";
  if (name.includes("Neural2")) return "Neural2";
  if (name.includes("Studio")) return "Studio";
  if (name.includes("Wavenet")) return "WaveNet";
  if (name.includes("Polyglot")) return "Polyglot";
  if (name.includes("Standard")) return "Standard";
  return "Outro";
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_TTS_API_KEY não configurada no .env.local" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?languageCode=pt-BR&key=${API_KEY}`,
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Google retornou ${res.status}`, detail: detail.slice(0, 200) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { voices?: GoogleVoice[] };
    const voices: VoiceItem[] = (data.voices ?? [])
      .filter((v) => (v.languageCodes ?? []).some((c) => c.startsWith("pt-BR")))
      .map((v) => ({
        name: v.name,
        gender: v.ssmlGender ?? "SSML_VOICE_GENDER_UNSPECIFIED",
        type: voiceType(v.name),
      }))
      .sort((a, b) => {
        const ra = TYPE_RANK[a.type] ?? 9;
        const rb = TYPE_RANK[b.type] ?? 9;
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ voices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar vozes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
