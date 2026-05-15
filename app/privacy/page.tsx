"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 w-fit">
          <span className="text-2xl font-bold text-[var(--text)]">Tixly</span>
        </Link>

        <p className="text-sm text-[var(--muted)] mb-8">
          Last updated: May 16, 2026
        </p>

        <h1 className="text-3xl font-bold text-[var(--text)] mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-[var(--text)]/80">
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              Introduction
            </h2>
            <p>
              At TixlyAi, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Screenshots</strong> - Images you upload to generate
                tickets. These are processed temporarily and not stored
                permanently on our servers.
              </li>
              <li>
                <strong>Text Input</strong> - Any text you provide when
                describing issues or requests.
              </li>
              <li>
                <strong>Account Information</strong> - Your email address and
                basic profile information provided by Clerk (our authentication
                provider).
              </li>
              <li>
                <strong>Usage Data</strong> - Information about how you use our
                service, including ticket generation counts and feature usage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              How We Use Your Data
            </h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Generate structured tickets from your screenshots</li>
              <li>Provide and maintain our services</li>
              <li>Improve and optimize our product</li>
              <li>Communicate with you about your account</li>
              <li>Enforce our terms and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              Data Storage
            </h2>
            <p>
              Your data is stored securely in our database (Neon PostgreSQL). We
              implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              Third-Party Services
            </h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Clerk</strong> - Authentication and user management
              </li>
              <li>
                <strong>OpenAI</strong> - AI-powered ticket generation from
                screenshots
              </li>
              <li>
                <strong>Neon</strong> - Database hosting
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              User Rights
            </h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a machine-readable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:bichitrabehera.345@gmail.com"
                className="text-[var(--primary)] hover:underline"
              >
                bichitrabehera.345@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
