"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="bg-[#ecfff1] min-h-screen flex flex-col items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: {
              shadow: "0 0 0 rgba(0, 0, 0, 0)",
            },
          },
        }}
        signUpUrl="/signup"
        routing="path"
        path="/login"
      />
    </div>
  );
}
