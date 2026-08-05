"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("alfred_token");
      if (token) {
        router.replace("/dashboard");
      } else {
        router.replace("/entrar");
      }
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1F4E79] border-t-transparent" />
    </div>
  );
}
