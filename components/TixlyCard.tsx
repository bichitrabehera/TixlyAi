import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TixlyCard() {
  return (
    <div className=" flex justify-center items-center py-6">
      <Button
        asChild
        size="sm"
        className="mt-3 gap-1 font-semibold transition hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl bg-orange-500"
      >
        <Link
          href="https://www.producthunt.com/products/tixly?embed=true&utm_source=embed&utm_medium=post_embed"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check it out on Product Hunt
        </Link>
      </Button>
    </div>
  );
}
