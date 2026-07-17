"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Team = { id: string; name: string };
type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [teams, setTeams] = useState<Team[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("teams")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) {
          setTeams(data);
          if (data[0]) setTeamId(data[0].id);
        }
      });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, team_id: teamId },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display uppercase tracking-[0.3em] text-xs text-accent mb-2">
            Largada
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            run<span className="text-accent">Chapter</span>
          </h1>
        </div>

        <div className="bg-surface border border-lane-line rounded-lg p-6">
          <div className="flex mb-6 text-sm font-display uppercase tracking-wide">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 pb-3 border-b-2 transition-colors ${
                mode === "login"
                  ? "border-accent text-foreground"
                  : "border-lane-line text-muted"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 pb-3 border-b-2 transition-colors ${
                mode === "signup"
                  ? "border-accent text-foreground"
                  : "border-lane-line text-muted"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Como o time vai te ver no ranking"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Seu time
                  </label>
                  <select
                    required
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-muted mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-raised border border-lane-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-background font-display uppercase tracking-wide font-semibold rounded-md py-2.5 text-sm hover:brightness-110 transition disabled:opacity-50"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                ? "Entrar"
                : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
