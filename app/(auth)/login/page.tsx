"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: {
            shadow: "0 0 0 rgba(0, 0, 0, 0)",
          },
        },
      }}
      routing="hash"
      signUpUrl="/signup"
    />
  );
}
