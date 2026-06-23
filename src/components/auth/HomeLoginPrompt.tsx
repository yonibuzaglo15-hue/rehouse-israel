"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";

export default function HomeLoginPrompt() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("login") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  return <LoginModal open={open} onClose={() => setOpen(false)} />;
}
