"use client";
// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--forest)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      color: "white", textAlign: "center", padding: "var(--sp-8)",
    }}>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "6rem",
        fontWeight: 700, color: "var(--gold)", lineHeight: 1,
        marginBottom: "var(--sp-4)",
      }}>
        404
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "white", marginBottom: "var(--sp-3)" }}>
        Page Not Found
      </h1>
      <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "var(--sp-8)", maxWidth: 360 }}>
        The page you are looking for does not exist or you may not have permission to view it.
      </p>
      <Link href="/dashboard">
        <button style={{
          background: "var(--gold)", color: "var(--forest)", border: "none",
          borderRadius: "var(--r-sm)", padding: "var(--sp-3) var(--sp-6)",
          fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}>
          ← Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
