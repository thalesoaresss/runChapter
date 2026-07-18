"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addChapterEntry(formData: FormData) {
  const chapterTitle = (formData.get("chapter_title") as string)?.trim();
  if (!chapterTitle) {
    return { error: "Informe o título do capítulo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada, faça login novamente." };
  }

  const { error } = await supabase
    .from("chapter_entries")
    .insert({ user_id: user.id, chapter_title: chapterTitle });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { error: null };
}

export async function updateChapterEntry(entryId: string, formData: FormData) {
  const chapterTitle = (formData.get("chapter_title") as string)?.trim();
  if (!chapterTitle) {
    return { error: "Informe o título do capítulo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada, faça login novamente." };
  }

  const { error } = await supabase
    .from("chapter_entries")
    .update({ chapter_title: chapterTitle })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/user/${user.id}`);
  revalidatePath("/");
  return { error: null };
}

export async function deleteChapterEntry(entryId: string) {
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

  revalidatePath(`/user/${user.id}`);
  revalidatePath("/");
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
