"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions";

type Team = { id: string; name: string };

export default function ProfileEditForm({
  displayName,
  email,
  teamId,
  teams,
}: {
  displayName: string;
  email: string;
  teamId: string | null;
  teams: Team[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(
        result.emailChanged
          ? "Dados salvos! Confirme o novo e-mail na sua caixa de entrada para concluir a troca."
          : "Dados salvos!"
      );
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div className="flex flex-col items-start gap-2">
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-muted hover:text-accent transition-colors border border-lane-line rounded-md px-3 py-1.5"
        >
          Editar dados pessoais
        </button>
        {success && (
          <p className="text-xs text-track-teal max-w-xs">{success}</p>
        )}
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="bg-surface border border-lane-line rounded-lg p-4 space-y-3 w-full sm:w-80"
    >
      <div>
        <label className="block text-xs text-muted mb-1.5">Nome</label>
        <input
          type="text"
          name="display_name"
          required
          defaultValue={displayName}
          className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-xs text-muted mb-1.5">Time</label>
        <select
          name="team_id"
          defaultValue={teamId ?? ""}
          className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1.5">E-mail</label>
        <input
          type="email"
          name="email"
          required
          defaultValue={email}
          className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="text-[11px] text-muted mt-1">
          Trocar o e-mail exige confirmação no novo endereço.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-background font-display uppercase tracking-wide font-semibold rounded-md px-4 py-2 text-sm hover:brightness-110 transition disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-foreground px-3 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
