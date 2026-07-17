import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ViewToggle from "@/components/ViewToggle";
import AddEntryForm from "@/components/AddEntryForm";
import { signOut } from "@/app/actions";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profiles }, { data: entries }, { data: teams }] =
    await Promise.all([
      supabase.from("profiles").select("id, display_name, team_id"),
      supabase.from("chapter_entries").select("user_id"),
      supabase.from("teams").select("id, name"),
    ]);

  const teamNameById = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const countByUser = new Map<string, number>();
  (entries ?? []).forEach((e) => {
    countByUser.set(e.user_id, (countByUser.get(e.user_id) ?? 0) + 1);
  });

  const racers = (profiles ?? []).map((p) => ({
    id: p.id,
    displayName: p.display_name,
    teamName: p.team_id ? teamNameById.get(p.team_id) ?? null : null,
    count: countByUser.get(p.id) ?? 0,
  }));

  const me = racers.find((r) => r.id === user.id);

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-start justify-between mb-8">
          <div>
            <p className="font-display uppercase tracking-[0.3em] text-xs text-accent mb-2">
              Ranking geral - LEVTY
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              run<span className="text-accent">Chapter</span>
            </h1>
            {me && (
              <p className="text-sm text-muted mt-2">
                Você já assistiu{" "}
                <span className="font-mono-num text-foreground">
                  {me.count}
                </span>{" "}
                capítulo{me.count === 1 ? "" : "s"}.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/user/${user.id}`}
              className="text-xs text-muted hover:text-foreground border border-lane-line rounded-md px-3 py-1.5 transition-colors"
            >
              Meus capítulos
            </a>
            <form action={signOut}>
              <button className="text-xs text-muted hover:text-foreground border border-lane-line rounded-md px-3 py-1.5 transition-colors">
                Sair
              </button>
            </form>
          </div>
        </header>

        <div className="mb-6">
          <AddEntryForm />
        </div>

        <ViewToggle racers={racers} />
      </div>
    </main>
  );
}
