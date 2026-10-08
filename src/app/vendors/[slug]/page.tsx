import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VendorHistory, VendorPlans } from "@/components/VendorPlans";
import { VendorDot } from "@/components/ui";
import { vendorBySlug, vendors } from "@/lib/data";

export function generateStaticParams() {
  return vendors.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata(props: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const v = vendorBySlug(slug);
  return v ? { title: v.name, description: v.tagline } : {};
}

export default async function VendorPage(props: PageProps<"/vendors/[slug]">) {
  const { slug } = await props.params;
  const vendor = vendorBySlug(slug);
  if (!vendor) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/" className="eyebrow hover:!text-ink">← All plans</Link>
        <div className="mt-5 flex items-center gap-4">
          <span className="corners grid h-14 w-14 shrink-0 place-items-center rounded-md border border-line bg-surface">
            <VendorDot vendor={vendor} size={30} />
          </span>
          <div>
            <div className="eyebrow">[ {vendor.company} ]</div>
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{vendor.name}</h1>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-lg text-ink">{vendor.tagline}</p>
        <p className="mt-2 max-w-3xl text-sm text-ink-2">{vendor.summary}</p>
        <a href={vendor.pricingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-accent-ink underline underline-offset-2">
          Official pricing page ↗
        </a>
      </div>

      <VendorPlans vendorId={vendor.id} />

      <section className="grid gap-4 md:grid-cols-2" aria-label="Strengths and caveats">
        <div className="card corners p-5">
          <h2 className="mb-2 font-semibold">Strengths</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-ink-2">
            {vendor.strengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div className="card corners p-5">
          <h2 className="mb-2 font-semibold">Watch out for</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-ink-2">
            {vendor.caveats.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </section>

      <VendorHistory vendorId={vendor.id} />

      <section aria-labelledby="sources">
        <h2 id="sources" className="mb-2 text-sm font-semibold">Sources</h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {vendor.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-accent-ink underline underline-offset-2">{s.label} ↗</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
