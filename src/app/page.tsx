"use client";
// src/app/page.tsx — redirect entry point

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RootPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
    else router.replace("/login");
  }, [user, router]);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--forest)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Loading…</div>
    </div>
  );
}
