"use client";

import { useState, useTransition } from "react";
import { updateChapterEntry, deleteChapterEntry } from "@/app/actions";

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
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateChapterEntry(entry.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Remover "${entry.chapterTitle}" do seu histórico?`)) return;
    startTransition(async () => {
      await deleteChapterEntry(entry.id);
    });
  }

  if (editing) {
    return (
      <form
        action={handleUpdate}
        className="flex items-center gap-2 px-4 py-3 border-b border-lane-line last:border-b-0"
      >
        <input
          type="text"
          name="chapter_title"
          defaultValue={entry.chapterTitle}
          autoFocus
          className="flex-1 bg-surface-raised border border-lane-line rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-display uppercase tracking-wide text-accent hover:brightness-125 disabled:opacity-50"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-muted hover:text-foreground"
        >
          Cancelar
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-lane-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{entry.chapterTitle}</p>
        <p className="text-[11px] text-muted">{formatDate(entry.viewedAt)}</p>
      </div>
      <button
        onClick={() => setEditing(true)}
        disabled={isPending}
        className="text-xs text-muted hover:text-accent transition-colors disabled:opacity-50"
      >
        Editar
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50"
      >
        Remover
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
          Nenhum capítulo registrado ainda.
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
