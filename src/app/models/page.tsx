import type { Metadata } from "next";
import { ModelsExplorer } from "@/components/ModelsExplorer";

export const metadata: Metadata = {
  title: "Models",
  description: "Intelligence, cost per task and API prices for the models behind AI coding plans.",
};

export default function ModelsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Models behind the plans</h1>
        <p className="mt-2 max-w-3xl text-ink-2">
          A plan is only as good as the models you can reach. Intelligence and cost per task come from the Artificial Analysis
          leaderboard, so a cheaper model that scores almost as high stretches every plan&apos;s allowance further.
        </p>
      </div>
      <ModelsExplorer />
    </div>
  );
}
