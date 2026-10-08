import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SettingsProvider } from "@/components/SettingsProvider";
import { LogoMark } from "@/components/LogoMark";
import { SiteNav } from "@/components/SiteNav";
import { AS_OF, vendors } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CodingPlans: AI coding plans vs API cost", template: "%s | CodingPlans" },
  description:
    "Compare Claude, Codex, Cursor, GitHub Copilot and other AI coding subscriptions by API-equivalent output per dollar, intelligence and capacity.",
};

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow corners mb-3 inline-block px-3.5 py-2.5 !text-ink">{title}</div>
      <ul className="flex flex-col gap-2 font-mono text-[12px] uppercase tracking-wide text-ink-2">{children}</ul>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const link = "hover:text-ink";
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SettingsProvider>
          <SiteNav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-6">{children}</main>
          <footer className="border-t border-line bg-surface-2/50">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <LogoMark size={24} />
                  CodingPlans
                </div>
                <p className="mt-2 max-w-xs font-mono text-[12px] leading-relaxed text-ink-2">
                  What each AI coding subscription is really worth at API prices. Plan data as of {fmtDate(AS_OF)}.
                  Estimated figures are editorial. Not financial advice.
                </p>
              </div>
              <FooterColumn title="Products">
                {vendors.map((v) => (
                  <li key={v.id}>
                    <Link href={`/vendors/${v.slug}`} className={link}>{v.name}</Link>
                  </li>
                ))}
              </FooterColumn>
              <FooterColumn title="Resources">
                <li><Link href="/" className={link}>Leaderboard</Link></li>
                <li><Link href="/models" className={link}>Models</Link></li>
                <li><Link href="/methodology" className={link}>Methodology</Link></li>
              </FooterColumn>
              <FooterColumn title="Data from">
                <li><a href="https://artificialanalysis.ai" target="_blank" rel="noreferrer" className={link}>Artificial Analysis</a></li>
                <li><a href="https://models.dev" target="_blank" rel="noreferrer" className={link}>models.dev logos</a></li>
                <li><Link href="/methodology" className={link}>Vendor pricing pages</Link></li>
              </FooterColumn>
            </div>
            <div className="mx-auto max-w-6xl px-4 pb-6 text-right font-mono text-[10px] uppercase tracking-widest text-ink-3 sm:px-6">
              Built with Next.js
            </div>
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
