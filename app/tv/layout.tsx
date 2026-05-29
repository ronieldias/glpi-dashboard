import { type ReactNode } from "react";
import { TVShell } from "@/components/tv/TVShell";

export const metadata = {
  title: "Fadex · Painel TV",
};

export default function TVLayout({ children }: { children: ReactNode }) {
  return <TVShell>{children}</TVShell>;
}
