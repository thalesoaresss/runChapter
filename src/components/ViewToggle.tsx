"use client";

import { useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import TeamLeaderboard from "@/components/TeamLeaderboard";

type Racer = {
  id: string;
  displayName: string;
  teamName: string | null;
  count: number;
};

export default function ViewToggle({ racers }: { racers: Racer[] }) {
  const [mode, setMode] = useState<"individual" | "team">("individual");

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("individual")}
          className={`text-xs font-display uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors ${
            mode === "individual"
              ? "border-accent text-accent bg-accent-soft"
              : "border-lane-line text-muted hover:text-foreground"
          }`}
        >
          Por pessoa
        </button>
        <button
          onClick={() => setMode("team")}
          className={`text-xs font-display uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors ${
            mode === "team"
              ? "border-accent text-accent bg-accent-soft"
              : "border-lane-line text-muted hover:text-foreground"
          }`}
        >
          Por time
        </button>
      </div>

      {mode === "individual" ? (
        <Leaderboard racers={racers} />
      ) : (
        <TeamLeaderboard racers={racers} />
      )}
    </div>
  );
}
