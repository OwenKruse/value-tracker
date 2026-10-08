import type { Metadata } from "next";
import { OverTime } from "@/components/OverTime";

export const metadata: Metadata = {
  title: "Value over time",
  description: "How AI coding plan subsidies, API prices and plan structures have changed.",
};

export default function ValueOverTimePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Value over time</h1>
        <p className="mt-2 max-w-3xl text-ink-2">
          Subsidies are not static. API prices fall, vendors add weekly caps, and tiers get split or renamed. This page tracks
          what can be dated and verified, and builds its own history each time you snapshot.
        </p>
      </div>
      <OverTime />
    </div>
  );
}
