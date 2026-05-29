import { NextRequest, NextResponse } from "next/server";

// Chave e voz ficam no servidor (.env.local — fora do git).
const API_KEY = process.env.GOOGLE_TTS_API_KEY;
// Voz feminina pt-BR da geração Chirp 3 HD (a mais natural). Trocável por env
// (ex.: pt-BR-Chirp3-HD-Kore, pt-BR-Chirp3-HD-Leda, ou pt-BR-Neural2-A).
const VOICE = process.env.GOOGLE_TTS_VOICE || "pt-BR-Chirp3-HD-Aoede";
const ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

// Cache em memória (texto+voz -> base64 mp3): frases repetidas (alertas, resumos)
// não voltam a chamar/cobrar a API do Google.
const cache = new Map<string, string>();
const MAX_CACHE = 300;

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_TTS_API_KEY não configurada no .env.local" },
      { status: 503 },
    );
  }

  let text = "";
  let voice = VOICE;
  try {
    const body = await request.json();
    text = String(body?.text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);
    // voz escolhida pelo cliente — só aceita pt-BR (evita input arbitrário)
    const requested = String(body?.voice ?? "").trim();
    if (/^pt-BR-[A-Za-z0-9-]+$/.test(requested)) voice = requested;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
  }

  const cacheKey = `${voice}::${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return audioResponse(cached);

  try {
    const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "pt-BR", name: voice },
        audioConfig: { audioEncoding: "MP3" },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Google TTS retornou ${res.status}`, detail: detail.slice(0, 300) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { audioContent?: string };
    const audioContent = data.audioContent;
    if (!audioContent) {
      return NextResponse.json(
        { error: "Resposta sem áudio do Google TTS" },
        { status: 502 },
      );
    }

    if (cache.size >= MAX_CACHE) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(cacheKey, audioContent);
    return audioResponse(audioContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no TTS";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function audioResponse(base64Mp3: string): NextResponse {
  const buffer = Buffer.from(base64Mp3, "base64");
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
