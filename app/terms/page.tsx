"use client";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#ecfff1] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 w-fit">
          <span className="text-2xl font-bold text-[(--text)]">Tixly</span>
        </Link>

        <p className="text-sm text-[(--muted)] mb-8">
          Last updated: May 16, 2026
        </p>

        <h1 className="text-3xl font-bold text-[(--text)] mb-8">
          Terms & Conditions
        </h1>

        <div className="space-y-8 text-[(--text)]/80">
          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              Use of Service
            </h2>
            <p>
              By accessing and using TixlyAi, you agree to be bound by these
              terms. Our service allows you to convert screenshots into
              structured bug tickets using AI technology. You must be at least
              18 years old to use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              User Responsibilities
            </h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not share your account with unauthorized users</li>
              <li>Use the service in compliance with all applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              Acceptable Use
            </h2>
            <p className="mb-2">You may NOT use our service to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Generate tickets containing malicious code or exploits</li>
              <li>Attempt to gain unauthorized access to any system</li>
              <li>
                Upload content that infringes on intellectual property rights
              </li>
              <li>Generate content that is illegal, harmful, or offensive</li>
              <li>Abuse or spam the service beyond normal usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              AI Limitations Disclaimer
            </h2>
            <p>
              Our service uses AI to generate tickets from screenshots. While we
              strive for accuracy, we cannot guarantee that all generated
              tickets will be correct or complete. You are responsible for
              reviewing and validating generated tickets before use. We are not
              liable for any decisions made based on AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              Payment Terms
            </h2>
            <p>
              Some features may require payment. If you purchase a paid plan,
              you agree to pay all fees associated with your subscription. All
              payments are non-refundable unless otherwise specified. We reserve
              the right to change pricing at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              Termination Rights
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at any
              time if you violate these terms. You may cancel your account at
              any time by contacting us. Upon termination, your right to use the
              service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TIXLYAI SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL
              LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN
              THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[(--text)] mb-3">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:bichitrabehera.345@gmail.com"
                className="text-[(--primary)] hover:underline"
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
