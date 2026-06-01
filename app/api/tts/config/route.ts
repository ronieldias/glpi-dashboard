import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultVoice,
  setDefaultVoice,
  isValidVoice,
  hasGoogleKey,
} from "@/lib/voice-config";

export async function GET() {
  return NextResponse.json({
    voice: await getDefaultVoice(),
    hasKey: hasGoogleKey(),
  });
}

export async function POST(request: NextRequest) {
  let voice = "";
  try {
    const body = await request.json();
    voice = String(body?.voice ?? "").trim();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!isValidVoice(voice)) {
    return NextResponse.json({ error: "Voz inválida" }, { status: 400 });
  }
  try {
    await setDefaultVoice(voice);
    return NextResponse.json({ ok: true, voice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
