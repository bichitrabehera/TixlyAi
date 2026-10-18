"use client";

import { Suspense } from "react";
import { SettingsPage } from "@/components/settings/SettingsPage";

export default function SettingsRoute() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
