"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { getQueryClient } from "@/shared/lib/query-client";
import { type AppStore, makeStore } from "@/shared/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  const queryClient = getQueryClient();

  return (
    <ReduxProvider store={storeRef.current}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}
