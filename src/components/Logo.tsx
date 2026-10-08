import type { Vendor } from "@/lib/types";

/** Logo ids shipped in /public/logos (see the README there for sources). */
const VENDOR_LOGO: Record<string, string | null> = {
  anthropic: "anthropic",
  openai: "openai",
  github: "github-copilot",
  google: "google",
  cursor: "cursor",
  cognition: "devin",
  kiro: "kiro",
  zed: "zed",
};

const CREATOR_LOGO: Record<string, string> = {
  Anthropic: "anthropic",
  OpenAI: "openai",
  Google: "google",
  Meta: "meta",
  SpaceXAI: "xai",
  "Z AI": "zai",
  Kimi: "moonshotai",
  DeepSeek: "deepseek",
  Alibaba: "alibaba",
  Mistral: "mistral",
  MiniMax: "minimax",
};

function Mask({ id, size }: { id: string; size: number }) {
  const url = `url(/logos/${id}.svg)`;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function Mono({ letter, size }: { letter: string; size: number }) {
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-[4px] border border-current font-mono font-semibold leading-none"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
    >
      {letter}
    </span>
  );
}

/** Icon for a product (vendor). Falls back to a monogram if a logo file is missing. */
export function VendorLogo({ vendor, size = 20 }: { vendor: Vendor; size?: number }) {
  const id = VENDOR_LOGO[vendor.id];
  return id ? <Mask id={id} size={size} /> : <Mono letter={vendor.name[0]} size={size} />;
}

/** Icon for a model lab (Artificial Analysis creator name); renders nothing if unknown. */
export function CreatorLogo({ creator, size = 16 }: { creator: string; size?: number }) {
  const id = CREATOR_LOGO[creator];
  return id ? <Mask id={id} size={size} /> : <Mono letter={creator[0] ?? "?"} size={size} />;
}
