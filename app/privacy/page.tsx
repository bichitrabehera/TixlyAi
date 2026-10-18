import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-shell py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 w-fit">
          <span className="text-2xl font-bold text-ink">Tixly</span>
        </Link>

        <p className="text-sm text-muted mb-8">
          Last updated: October 19, 2026
        </p>

        <h1 className="text-3xl font-bold text-ink mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-muted">
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Introduction
            </h2>
            <p>
              Tixly is a free, bring-your-own-key (BYOK) tool that turns
              screenshots into structured tickets. This Privacy Policy explains
              what we collect, how we use it, and the choices you have. Tixly is
              free — we do not sell your data and there is no paid tier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Account information</strong> — Your email address and
                basic profile (such as your name), provided through Clerk, our
                authentication provider.
              </li>
              <li>
                <strong>Screenshots and text you submit</strong> — The images
                and any description you provide to generate a ticket.
              </li>
              <li>
                <strong>AI provider keys (BYOK)</strong> — The OpenAI,
                OpenRouter, or Anthropic API key you add. Keys are encrypted at
                rest with AES-256-GCM, decrypted only on our servers for the
                duration of a request, never returned to your browser, and never
                logged.
              </li>
              <li>
                <strong>Integration credentials</strong> — Slack and Linear
                tokens/keys you connect, encrypted at rest the same way.
              </li>
              <li>
                <strong>Generated tickets</strong> — The tickets created from
                your input, kept so you can review your history.
              </li>
              <li>
                <strong>Usage data</strong> — Basic information about how you
                use the service, such as ticket generation counts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              How We Use Your Data
            </h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Generate structured tickets from your screenshots and text</li>
              <li>Provide, maintain, and secure the service</li>
              <li>Store your ticket history so you can revisit it</li>
              <li>
                Push tickets to Slack or Linear when you ask us to
              </li>
              <li>Prevent abuse and enforce our Terms &amp; Conditions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              AI Processing
            </h2>
            <p>
              Ticket generation runs through the AI provider you connect, using
              your own API key. Your screenshots and text are sent to that
              provider (OpenAI, OpenRouter, or Anthropic) solely to generate the
              ticket, and their terms and privacy policies govern that
              processing. We do not run the models ourselves.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Data Storage &amp; Retention
            </h2>
            <p>
              Tickets, account records, and encrypted credentials are stored in
              our database (Neon PostgreSQL). Screenshots are uploaded to
              ImageKit, our image-hosting provider, and your tickets reference
              that image URL. We keep your data while your account is active;
              you can ask us to delete it at any time (see Contact below).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Third-Party Services
            </h2>
            <p className="mb-2">
              We rely on the following providers to run Tixly:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Clerk</strong> — authentication and account management
              </li>
              <li>
                <strong>Neon</strong> — database hosting
              </li>
              <li>
                <strong>ImageKit</strong> — screenshot image hosting
              </li>
              <li>
                <strong>OpenAI, OpenRouter, or Anthropic</strong> — AI
                generation under your own key
              </li>
              <li>
                <strong>Slack and Linear</strong> — optional ticket exports you
                connect
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Your Rights
            </h2>
            <p className="mb-2">You can ask us to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide a copy of your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data and account</li>
              <li>Export your tickets in a machine-readable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Security
            </h2>
            <p>
              API keys and integration credentials are encrypted at rest with
              AES-256-GCM and decrypted only server-side, per request. We use
              HTTPS in transit and restrict access to production systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Children
            </h2>
            <p>
              Tixly is not directed at children, and you must be old enough to
              form a binding contract in your jurisdiction to use it. We do not
              knowingly collect data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will revise the &quot;Last updated&quot; date above, and
              material changes will be communicated in the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:bichitrabehera.345@gmail.com"
                className="text-primary hover:underline"
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
