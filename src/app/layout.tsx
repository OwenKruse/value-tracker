import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SettingsProvider } from "@/components/SettingsProvider";
import { SiteNav } from "@/components/SiteNav";
import { AS_OF } from "@/lib/data";
import { fmtDate } from "@/lib/format";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Value Tracker: AI coding plans vs API cost", template: "%s | Value Tracker" },
  description:
    "Compare Claude, Codex, Cursor, GitHub Copilot and other AI coding subscriptions by API-equivalent output per dollar, intelligence and capacity.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SettingsProvider>
          <SiteNav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-ink-3 sm:px-6">
              <p>
                Plan data as of {fmtDate(AS_OF)}. Published figures come from vendor pages; estimated figures are
                editorial and labelled as such. Not financial advice.{" "}
                <Link href="/methodology" className="underline underline-offset-2 hover:text-ink">
                  How this is calculated
                </Link>
              </p>
            </div>
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
