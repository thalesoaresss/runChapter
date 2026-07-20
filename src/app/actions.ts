"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isAdmin: false as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { supabase, user, isAdmin: Boolean(profile?.is_admin) };
}

export async function markChapterSeen(chapterId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada, faça login novamente." };
  }

  const { error } = await supabase
    .from("chapter_entries")
    .insert({ user_id: user.id, chapter_id: chapterId });

  if (error) {
    if (error.code === "23505") {
      return { error: "Você já marcou esse capítulo como visto." };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/user/${user.id}`);
  return { error: null };
}

export async function unmarkChapterSeen(entryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada, faça login novamente." };
  }

  const { error } = await supabase
    .from("chapter_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/user/${user.id}`);
  return { error: null };
}

export async function updateProfile(formData: FormData) {
  const displayName = (formData.get("display_name") as string)?.trim();
  const teamId = (formData.get("team_id") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!displayName) {
    return { error: "Informe seu nome." };
  }
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada, faça login novamente." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: displayName, team_id: teamId || null })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  let emailChanged = false;
  if (email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) {
      return { error: emailError.message };
    }
    emailChanged = true;
  }

  revalidatePath(`/user/${user.id}`);
  revalidatePath("/");
  return { error: null, emailChanged };
}

// --- Admin: gestão de capítulos ---

export async function createChapter(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return { error: "Informe o título do capítulo." };
  }

  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { error: "Só administradores podem cadastrar capítulos." };
  }

  const { error } = await supabase.from("chapters").insert({ title });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function toggleChapterActive(chapterId: string, isActive: boolean) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { error: "Só administradores podem alterar capítulos." };
  }

  const { error } = await supabase
    .from("chapters")
    .update({ is_active: isActive })
    .eq("id", chapterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function deleteChapter(chapterId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { error: "Só administradores podem remover capítulos." };
  }

  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
