"use client";

import { useTransition } from "react";
import { unmarkChapterSeen } from "@/app/actions";

export type Entry = {
  id: string;
  chapterTitle: string;
  viewedAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function EditableRow({ entry }: { entry: Entry }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(`Desmarcar "${entry.chapterTitle}" como visto?`)) return;
    startTransition(async () => {
      await unmarkChapterSeen(entry.id);
    });
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-lane-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{entry.chapterTitle}</p>
        <p className="text-[11px] text-muted">{formatDate(entry.viewedAt)}</p>
      </div>
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50"
      >
        Desmarcar
      </button>
    </div>
  );
}

function ReadOnlyRow({ entry }: { entry: Entry }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-lane-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{entry.chapterTitle}</p>
        <p className="text-[11px] text-muted">{formatDate(entry.viewedAt)}</p>
      </div>
    </div>
  );
}

export default function EntryList({
  entries,
  editable,
}: {
  entries: Entry[];
  editable: boolean;
}) {
  return (
    <div className="bg-surface border border-lane-line rounded-lg overflow-hidden">
      {entries.length === 0 && (
        <p className="text-sm text-muted px-4 py-6 text-center">
          Nenhum capítulo marcado como visto ainda.
        </p>
      )}
      {entries.map((entry) =>
        editable ? (
          <EditableRow key={entry.id} entry={entry} />
        ) : (
          <ReadOnlyRow key={entry.id} entry={entry} />
        )
      )}
    </div>
  );
}
