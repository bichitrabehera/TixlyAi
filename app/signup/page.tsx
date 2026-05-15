"use client";

import { SignUp } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-slate-900">TixlyAi</span>
      </Link>

      <SignUp
        appearance={{
          elements: {
            rootBox: {
              width: "100%",
              maxWidth: "400px",
            },
          },
        }}
        signInUrl="/login"
        routing="path"
        path="/signup"
      />
    </div>
  );
}