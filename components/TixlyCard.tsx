import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TixlyCard() {
  return (
    <div className="flex items-center justify-center py-6">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="gap-1.5 border-hairline bg-[#F52B20] font-medium text-white transition-all hover:-translate-y-0.5 hover:text-ink"
      >
        <Link
          href="https://www.producthunt.com/products/tixly?embed=true&utm_source=embed&utm_medium=post_embed"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check it out on Product Hunt
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
