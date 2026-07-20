"use client";

import { useMemo, useState, useTransition } from "react";
import { markChapterSeen } from "@/app/actions";

type Chapter = { id: string; title: string };

export default function ChapterPicker({
  availableChapters,
  seenChapterIds,
}: {
  availableChapters: Chapter[];
  seenChapterIds: string[];
}) {
  const [seen, setSeen] = useState(new Set(seenChapterIds));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pending = useMemo(
    () => availableChapters.filter((c) => !seen.has(c.id)),
    [availableChapters, seen]
  );

  const [selectedId, setSelectedId] = useState(pending[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const chapter = pending.find((c) => c.id === selectedId);
      const result = await markChapterSeen(selectedId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSeen((prev) => new Set(prev).add(selectedId));
      setSuccess(chapter ? `"${chapter.title}" marcado como visto!` : null);
      const next = pending.find((c) => c.id !== selectedId);
      setSelectedId(next?.id ?? "");
    });
  }

  return (
    <div className="bg-surface border border-lane-line rounded-lg p-4">
      <p className="text-xs text-muted mb-3">
        Escolha um capítulo que você assistiu:
      </p>

      {pending.length === 0 ? (
        <p className="text-sm text-muted">
          Você já marcou todos os capítulos disponíveis. 🎉
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 min-w-0 bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {pending.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending || !selectedId}
            className="bg-accent text-background font-display uppercase tracking-wide font-semibold rounded-md px-5 py-2 text-sm hover:brightness-110 transition disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? "Marcando..." : "Marcar como visto"}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
      {success && <p className="text-xs text-track-teal mt-3">{success}</p>}
    </div>
  );
}
