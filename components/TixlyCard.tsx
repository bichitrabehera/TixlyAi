import Image from "next/image";
import Link from "next/link";

export default function TixlyCard() {
  return (
    <div className=" flex justify-center items-center py-6">
      <Link
        href="https://www.producthunt.com/products/tixly?embed=true&utm_source=embed&utm_medium=post_embed"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#ff6154] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
      >
        Check it out on Product Hunt
      </Link>
    </div>
  );
}
