"use client";

import { useEffect, useRef } from "react";
import { TicketTypeLabel } from "@/types/glpi";

interface RecentTicket {
  id: number;
  name: string;
  type: number;
  typeLabel: string;
  recipientName: string;
  location: string;
  date_creation: string;
}

export function useTicketAnnouncer(tickets: RecentTicket[] | undefined) {
  const announcedIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    // Na primeira carga, apenas registrar os IDs existentes sem anunciar
    if (isFirstLoad.current) {
      tickets.forEach((t) => announcedIds.current.add(t.id));
      isFirstLoad.current = false;
      return;
    }

    // Detectar novos chamados
    const newTickets = tickets.filter((t) => !announcedIds.current.has(t.id));

    newTickets.forEach((ticket) => {
      announcedIds.current.add(ticket.id);
      announceTicket(ticket);
    });
  }, [tickets]);
}

function announceTicket(ticket: {
  name: string;
  typeLabel: string;
  recipientName: string;
  location: string;
}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancelar qualquer fala anterior
  window.speechSynthesis.cancel();

  const tipo = ticket.typeLabel || "Chamado";
  const titulo = ticket.name || "Sem titulo";
  const usuario = ticket.recipientName || "Desconhecido";
  const setor = ticket.location || "Nao informado";

  const text = `Novo chamado cadastrado. Tipo: ${tipo}. Titulo: ${titulo}. Usuario: ${usuario}. Setor: ${setor}.`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Tentar usar uma voz pt-BR se disponivel
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(
    (v) => v.lang.startsWith("pt") && v.lang.includes("BR")
  );
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  window.speechSynthesis.speak(utterance);
}
