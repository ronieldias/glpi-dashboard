import { NextResponse } from "next/server";
import { glpiFetch } from "@/lib/glpi-client";

export async function GET() {
  try {
    // Teste de sessão: tenta buscar info da sessão
    const data = await glpiFetch<Record<string, unknown>>("/getActiveProfile");
    return NextResponse.json({ ok: true, profile: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
