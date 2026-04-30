"use client";
// src/app/teacher/report-cards/page.tsx
// Teachers can generate report cards for their students.
// Reuses the same logic as admin — just role-gated to "teacher".

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AdminReportCardsPage from "@/app/admin/report-cards/page";

export default function TeacherReportCardsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role === "student") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role === "student") return null;

  // Render the same report card UI — role check inside allows both admin + teacher
  return <AdminReportCardsPage />;
}
