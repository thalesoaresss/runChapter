import Link from "next/link";

type Racer = {
  id: string;
  displayName: string;
  teamName: string | null;
  count: number;
};

export default function Leaderboard({ racers }: { racers: Racer[] }) {
  const maxCount = Math.max(1, ...racers.map((r) => r.count));

  const sorted = [...racers].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-surface border border-lane-line rounded-lg overflow-hidden">
      {sorted.length === 0 && (
        <p className="text-sm text-muted px-4 py-6 text-center">
          Ninguém registrou capítulo ainda. Seja o primeiro a largar.
        </p>
      )}
      {sorted.map((racer, i) => {
        const pct = Math.max(6, (racer.count / maxCount) * 100);
        return (
          <div
            key={racer.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-lane-line last:border-b-0"
          >
            <span className="font-mono-num text-muted text-sm w-5 shrink-0">
              {i + 1}
            </span>

            <div className="w-32 sm:w-40 shrink-0">
              <Link
                href={`/user/${racer.id}`}
                className="text-sm font-medium truncate block hover:text-accent transition-colors"
              >
                {racer.displayName}
              </Link>
              {racer.teamName && (
                <p className="text-[11px] text-muted truncate">
                  {racer.teamName}
                </p>
              )}
            </div>

            <div className="flex-1 h-6 lane-track relative rounded-sm">
              <div
                className="absolute inset-y-0 left-0 flex items-center transition-all duration-500"
                style={{ width: `${pct}%` }}
              >
                <span
                  className={`ml-auto -mr-2 h-3 w-3 rounded-full ${
                    i === 0 ? "bg-leader" : "bg-track-teal"
                  } shadow-[0_0_8px_rgba(255,183,3,0.6)]`}
                />
              </div>
            </div>

            <span className="font-mono-num text-sm w-10 text-right shrink-0 tabular-nums">
              {racer.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
