"use client";

import { useState } from "react";
import Link from "next/link";
import { Bug, Sparkles, Wand2, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const DETAIL_OPTIONS = [
  { value: "concise", label: "Concise" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
] as const;

type DetailOption = (typeof DETAIL_OPTIONS)[number]["value"];

const SAMPLE_TICKET = JSON.stringify(
  {
    type: "bug",
    title: "Checkout button stays disabled after applying a coupon",
    priority: "HIGH",
    severity: "HIGH",
    component: "Checkout / Coupons",
    description:
      "Applying a valid coupon leaves the Place order button disabled until the page is reloaded.",
    steps: [
      "Add any item to the cart and open checkout.",
      "Enter coupon SAVE10 and apply it.",
      "Observe the Place order button remains disabled.",
    ],
    expected: "The Place order button is enabled once the coupon applies.",
    actual: "The button stays disabled until a full reload.",
    environment: "Chrome 129 · macOS 15 · production",
  },
  null,
  2,
);

export default function PlaygroundPage() {
  const [detail, setDetail] = useState<DetailOption>("standard");

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <PageHeader
        title="Playground"
        subtitle="A scratch space for previewing primitives and ticket rendering."
        actions={
          <Button asChild size="sm" className="gap-2">
            <Link href={ROUTES.generate}>
              <Wand2 className="size-4" />
              Open generator
            </Link>
          </Button>
        }
      />

      <section className="rounded-2xl border border-(--border) bg-(--card) p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-(--text)">
          Segmented control
        </h2>
        <p className="mt-1 text-sm text-(--muted)">
          Roving focus, arrow-key navigation, single accent.
        </p>
        <div className="mt-4 max-w-sm">
          <SegmentedControl<DetailOption>
            value={detail}
            onChange={setDetail}
            ariaLabel="Detail level"
            options={DETAIL_OPTIONS.map((option) => ({ ...option }))}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button className="gap-2">
            <Zap className="size-4" />
            Primary
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="size-4" />
            Outline
          </Button>
          <Button variant="ghost" className="gap-2">
            <Bug className="size-4" />
            Ghost
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--border) bg-(--card) p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-(--text)">
          Ticket preview
        </h2>
        <p className="mt-1 text-sm text-(--muted)">
          How a generated ticket renders in the read-only card.
        </p>
        <div className="mt-5">
          <TicketCard ticketText={SAMPLE_TICKET} />
        </div>
      </section>
    </div>
  );
}
