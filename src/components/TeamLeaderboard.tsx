import Link from "next/link";

type Racer = {
  id: string;
  displayName: string;
  teamName: string | null;
  count: number;
};

export default function TeamLeaderboard({ racers }: { racers: Racer[] }) {
  const groups = new Map<string, Racer[]>();
  racers.forEach((r) => {
    const key = r.teamName ?? "Sem time";
    groups.set(key, [...(groups.get(key) ?? []), r]);
  });

  const teams = Array.from(groups.entries())
    .map(([teamName, members]) => ({
      teamName,
      members: [...members].sort((a, b) => b.count - a.count),
      total: members.reduce((sum, m) => sum + m.count, 0),
    }))
    .sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(1, ...teams.map((t) => t.total));

  return (
    <div className="space-y-4">
      {teams.length === 0 && (
        <p className="text-sm text-muted px-4 py-6 text-center bg-surface border border-lane-line rounded-lg">
          Ninguém registrou capítulo ainda.
        </p>
      )}
      {teams.map((team, i) => {
        const pct = Math.max(6, (team.total / maxTotal) * 100);
        return (
          <div
            key={team.teamName}
            className="bg-surface border border-lane-line rounded-lg overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-lane-line">
              <span className="font-mono-num text-muted text-sm w-5 shrink-0">
                {i + 1}
              </span>
              <p className="font-display uppercase tracking-wide text-sm font-semibold flex-1 truncate">
                {team.teamName}
              </p>
              <div className="flex-1 h-5 lane-track relative rounded-sm max-w-[40%]">
                <div
                  className="absolute inset-y-0 left-0 flex items-center transition-all duration-500"
                  style={{ width: `${pct}%` }}
                >
                  <span
                    className={`ml-auto -mr-2 h-2.5 w-2.5 rounded-full ${
                      i === 0 ? "bg-accent" : "bg-track-teal"
                    } shadow-[0_0_8px_rgba(0,150,213,0.6)]`}
                  />
                </div>
              </div>
              <span className="font-mono-num text-sm w-10 text-right shrink-0 tabular-nums">
                {team.total}
              </span>
            </div>

            {team.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-4 py-2 pl-11 border-b border-lane-line last:border-b-0"
              >
                <Link
                  href={`/user/${m.id}`}
                  className="text-xs flex-1 truncate hover:text-accent transition-colors"
                >
                  {m.displayName}
                </Link>
                <span className="font-mono-num text-xs text-muted tabular-nums">
                  {m.count}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
