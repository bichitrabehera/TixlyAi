import { db } from "./index";
import { users, tickets } from "./schema";
import { eq } from "drizzle-orm";
import { type AiProvider } from "@/lib/constants";

export async function getOrCreateUser(clerkUserId: string, email: string) {
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));

  if (user) {
    return user;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      clerkUserId,
      email,
    })
    .returning();

  return newUser;
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
