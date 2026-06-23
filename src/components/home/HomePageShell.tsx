"use client";

import type { ReactNode } from "react";
import { HeroCityProvider } from "@/contexts/HeroCityContext";

export default function HomePageShell({ children }: { children: ReactNode }) {
  return <HeroCityProvider>{children}</HeroCityProvider>;
}
