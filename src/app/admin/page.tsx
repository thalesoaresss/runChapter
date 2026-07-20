import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminChapterList from "@/components/AdminChapterList";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, is_active")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground inline-block mb-6"
        >
          ← Voltar ao ranking
        </Link>

        <header className="mb-8">
          <p className="font-display uppercase tracking-[0.3em] text-xs text-accent mb-2">
            Painel
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Gerenciar capítulos
          </h1>
          <p className="text-sm text-muted mt-2">
            Capítulos desativados somem da tela de marcação, mas continuam
            valendo no histórico de quem já assistiu.
          </p>
        </header>

        <AdminChapterList initialChapters={chapters ?? []} />
      </div>
    </main>
  );
}
