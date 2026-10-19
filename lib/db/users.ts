import { db } from "./index";
import { users, tickets, aiKeys } from "./schema";
import { desc, eq, and } from "drizzle-orm";
import { type AiProvider } from "@/lib/constants";

export async function getOrCreateUser(clerkUserId: string, email: string) {
  // Atomic upsert: the old select-then-insert raced on concurrent first
  // requests (ticket save + key save) and threw a unique violation.
  const [user] = await db
    .insert(users)
    .values({ clerkUserId, email })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      // On conflict keep the stored email unless we have a real one.
      set: { email: email || undefined },
    })
    .returning();

  return user;
}

export async function getUserByClerkId(clerkUserId: string) {
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  return user || null;
}

export async function updateSlackTokens(
  clerkUserId: string,
  encryptedToken: string,
  slackUserId: string,
) {
  await db
    .update(users)
    .set({
      slackEncryptedToken: encryptedToken,
      slackUserId,
    })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function clearSlackTokens(clerkUserId: string) {
  await db
    .update(users)
    .set({
      slackEncryptedToken: null,
      slackUserId: null,
    })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function getSlackTokens(clerkUserId: string) {
  const user = await getUserByClerkId(clerkUserId);
  if (!user?.slackEncryptedToken || !user?.slackUserId) {
    return null;
  }
  return {
    encryptedToken: user.slackEncryptedToken,
    slackUserId: user.slackUserId,
  };
}

export async function updateLinearKey(clerkUserId: string, encryptedKey: string) {
  await db
    .update(users)
    .set({ linearEncryptedKey: encryptedKey })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function getLinearKey(clerkUserId: string) {
  const user = await getUserByClerkId(clerkUserId);
  return user?.linearEncryptedKey || null;
}

export async function removeLinearKey(clerkUserId: string) {
  await db
    .update(users)
    .set({ linearEncryptedKey: null })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function updateAiKey(clerkUserId: string, encryptedKey: string, provider: AiProvider) {
  await db
    .update(users)
    .set({ aiEncryptedKey: encryptedKey, aiProvider: provider })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function getAiKey(clerkUserId: string) {
  const user = await getUserByClerkId(clerkUserId);
  if (!user?.aiEncryptedKey || !user?.aiProvider) return null;
  return { encryptedKey: user.aiEncryptedKey, provider: user.aiProvider as AiProvider };
}

export async function deleteAiKey(clerkUserId: string) {
  await db
    .update(users)
    .set({ aiEncryptedKey: null, aiProvider: null })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function listAiKeys(clerkUserId: string) {
  return db
    .select()
    .from(aiKeys)
    .where(eq(aiKeys.clerkUserId, clerkUserId))
    .orderBy(desc(aiKeys.updatedAt));
}

export async function getAiKeyForProvider(
  clerkUserId: string,
  provider: AiProvider,
) {
  const [row] = await db
    .select()
    .from(aiKeys)
    .where(
      and(eq(aiKeys.clerkUserId, clerkUserId), eq(aiKeys.provider, provider)),
    )
    .limit(1);
  return row ?? null;
}

export async function upsertAiKey(
  clerkUserId: string,
  provider: AiProvider,
  encryptedKey: string,
  keyHint: string,
) {
  await getOrCreateUser(clerkUserId, "");
  await db
    .insert(aiKeys)
    .values({
      clerkUserId,
      provider,
      encryptedKey,
      keyHint,
      status: "valid",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [aiKeys.clerkUserId, aiKeys.provider],
      set: {
        encryptedKey,
        keyHint,
        status: "valid",
        updatedAt: new Date(),
      },
    });
}

export async function deleteAiKeyForProvider(
  clerkUserId: string,
  provider: AiProvider,
) {
  await db
    .delete(aiKeys)
    .where(
      and(eq(aiKeys.clerkUserId, clerkUserId), eq(aiKeys.provider, provider)),
    );
}

export async function deleteAllAiKeys(clerkUserId: string) {
  await db.delete(aiKeys).where(eq(aiKeys.clerkUserId, clerkUserId));
}

export async function setAiKeyStatus(
  clerkUserId: string,
  provider: AiProvider,
  status: "valid" | "invalid",
) {
  await db
    .update(aiKeys)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(aiKeys.clerkUserId, clerkUserId), eq(aiKeys.provider, provider)),
    );
}

export async function updateProfile(clerkUserId: string, name: string) {
  await db
    .update(users)
    .set({ name })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function updateNotifications(clerkUserId: string, enabled: boolean) {
  await db
    .update(users)
    .set({ notificationEmail: enabled ? "on" : "off" })
    .where(eq(users.clerkUserId, clerkUserId));
}

export async function deleteUserData(clerkUserId: string) {
  await db.delete(tickets).where(eq(tickets.userId, clerkUserId));
  await db.delete(users).where(eq(users.clerkUserId, clerkUserId));
}
