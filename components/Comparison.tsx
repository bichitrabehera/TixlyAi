import { Check } from "lucide-react";
import { COMPARISON } from "@/lib/data";

export default function ComparisonPage() {
  return (
    <section className="py-16 lg:py-24 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 sm:text-5xl lg:text-5xl text-slate-900">
            {COMPARISON.title}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {COMPARISON.subtitle}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-semibold text-center mb-6 text-slate-900">
            How we compare
          </h2>

          <div className="overflow-x-auto">
            <table className="max-w-4xl mx-auto border border-slate-200 text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 text-left font-semibold text-slate-700">
                    Feature
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700">
                    Other tools
                  </th>
                  <th className="p-4 text-left font-semibold text-green-700">
                    TixlyAI
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-slate-200 bg-white">
                  <td className="p-4 font-medium text-slate-900">Price</td>
                  <td className="p-4 text-slate-500">
                    {COMPARISON.competitors.map((c) => c.price).join(" / ")}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {COMPARISON.tixly.price}
                  </td>
                </tr>

                <tr className="border-t border-slate-200 bg-white">
                  <td className="p-4 font-medium text-slate-900">Platform</td>
                  <td className="p-4 text-slate-500">
                    {COMPARISON.competitors.map((c) => c.platform).join(" / ")}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {COMPARISON.tixly.platform}
                  </td>
                </tr>

                <tr className="border-t border-slate-200 bg-white">
                  <td className="p-4 font-medium text-slate-900">
                    Integrations
                  </td>
                  <td className="p-4 text-slate-500">
                    {COMPARISON.competitors
                      .map((c) => c.integrations)
                      .join(" / ")}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {COMPARISON.tixly.integrations}
                  </td>
                </tr>

                <tr className="border-t border-slate-200 bg-white">
                  <td className="p-4 font-medium text-slate-900">
                    Key Advantage
                  </td>
                  <td className="p-4 text-slate-500">
                    Limited / fragmented tools
                  </td>
                  <td className="p-4 font-bold text-green-700">
                    {COMPARISON.tixly.advantage}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </section>
  );
}
