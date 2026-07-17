"use client";

import { useRef, useState, useTransition } from "react";
import { addChapterEntry } from "@/app/actions";

export default function AddEntryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await addChapterEntry(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
        setTimeout(() => setSuccess(false), 2500);
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-surface border border-lane-line rounded-lg p-4 flex flex-col sm:flex-row gap-3"
    >
      <input
        type="text"
        name="chapter_title"
        required
        placeholder="Título do capítulo que você assistiu"
        className="flex-1 bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-background font-display uppercase tracking-wide font-semibold rounded-md px-5 py-2 text-sm hover:brightness-110 transition disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? "Registrando..." : "Marcar como visto"}
      </button>
      {error && <p className="text-sm text-red-400 sm:self-center">{error}</p>}
      {success && (
        <p className="text-sm text-track-teal sm:self-center">Registrado!</p>
      )}
    </form>
  );
}
