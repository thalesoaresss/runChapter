"use client";

import { useRef, useState, useTransition } from "react";
import {
  createChapter,
  toggleChapterActive,
  deleteChapter,
} from "@/app/actions";

type Chapter = { id: string; title: string; is_active: boolean };

export default function AdminChapterList({
  initialChapters,
}: {
  initialChapters: Chapter[];
}) {
  const [chapters, setChapters] = useState(initialChapters);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createChapter(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      // O server action já revalida a página; refletimos localmente também
      // pra resposta imediata antes do refresh.
    });
  }

  function handleToggle(chapter: Chapter) {
    setError(null);
    startTransition(async () => {
      const result = await toggleChapterActive(
        chapter.id,
        !chapter.is_active
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapter.id ? { ...c, is_active: !c.is_active } : c
        )
      );
    });
  }

  function handleDelete(chapter: Chapter) {
    if (
      !confirm(
        `Remover "${chapter.title}"? Isso também apaga os registros de quem já marcou como visto.`
      )
    )
      return;

    setError(null);
    startTransition(async () => {
      const result = await deleteChapter(chapter.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
    });
  }

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={handleCreate}
        className="bg-surface border border-lane-line rounded-lg p-4 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          name="title"
          required
          placeholder="Título do novo capítulo"
          className="flex-1 bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-background font-display uppercase tracking-wide font-semibold rounded-md px-5 py-2 text-sm hover:brightness-110 transition disabled:opacity-50 whitespace-nowrap"
        >
          Adicionar capítulo
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-surface border border-lane-line rounded-lg overflow-hidden">
        {chapters.length === 0 && (
          <p className="text-sm text-muted px-4 py-6 text-center">
            Nenhum capítulo cadastrado ainda.
          </p>
        )}
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-lane-line last:border-b-0"
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                chapter.is_active ? "bg-track-teal" : "bg-muted"
              }`}
            />
            <p
              className={`text-sm flex-1 truncate ${
                chapter.is_active ? "" : "text-muted line-through"
              }`}
            >
              {chapter.title}
            </p>
            <button
              onClick={() => handleToggle(chapter)}
              disabled={isPending}
              className="text-xs text-muted hover:text-accent transition-colors disabled:opacity-50"
            >
              {chapter.is_active ? "Desativar" : "Ativar"}
            </button>
            <button
              onClick={() => handleDelete(chapter)}
              disabled={isPending}
              className="text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
