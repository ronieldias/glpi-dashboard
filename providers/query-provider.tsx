"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 20,
            retry: 2,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: true,
          },
          mutations: {
            onError: (error) => {
              toast({
                variant: "destructive",
                title: "Erro",
                description:
                  error instanceof Error
                    ? error.message
                    : "Ocorreu um erro inesperado",
              });
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
