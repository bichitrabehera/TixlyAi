import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CALL_TO_ACTION } from "@/lib/data";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="border-t border-hairline py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <h2 className="mb-6 text-4xl font-bold text-ink">
          {CALL_TO_ACTION.title}
        </h2>
        <p className="mb-8 text-lg text-muted">{CALL_TO_ACTION.description}</p>
        <Button asChild size="lg" className="gap-2">
          <Link href={ROUTES.generate}>
            {CALL_TO_ACTION.button}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
