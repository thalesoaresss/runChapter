import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryList from "@/components/EntryList";
import ProfileEditForm from "@/components/ProfileEditForm";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: entries }, { data: teams }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, team_id, teams ( name )")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("chapter_entries")
        .select("id, chapter_title, viewed_at")
        .eq("user_id", id)
        .order("viewed_at", { ascending: false }),
      supabase.from("teams").select("id, name").order("name"),
    ]);

  if (!profile) {
    notFound();
  }

  const isOwnProfile = user.id === id;
  const teamName = (profile as unknown as { teams: { name: string } | null })
    .teams?.name;

  const mappedEntries = (entries ?? []).map((e) => ({
    id: e.id,
    chapterTitle: e.chapter_title,
    viewedAt: e.viewed_at,
  }));

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground inline-block mb-6"
        >
          ← Voltar ao ranking
        </Link>

        <header className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <p className="font-display uppercase tracking-[0.3em] text-xs text-accent mb-2">
              {isOwnProfile ? "Seu histórico" : "Histórico"}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {profile.display_name}
            </h1>
            {teamName && (
              <p className="text-sm text-muted mt-1">{teamName}</p>
            )}
            <p className="text-sm text-muted mt-2">
              <span className="font-mono-num text-foreground">
                {mappedEntries.length}
              </span>{" "}
              capítulo{mappedEntries.length === 1 ? "" : "s"} assistido
              {mappedEntries.length === 1 ? "" : "s"}
            </p>
          </div>

          {isOwnProfile && (
            <ProfileEditForm
              displayName={profile.display_name}
              email={user.email ?? ""}
              teamId={profile.team_id}
              teams={teams ?? []}
            />
          )}
        </header>

        <EntryList entries={mappedEntries} editable={isOwnProfile} />
      </div>
    </main>
  );
}
