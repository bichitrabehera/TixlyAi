import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

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
      plan: "free",
    })
    .returning();
  
  return newUser;
}

export async function getUserByClerkId(clerkUserId: string) {
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  return user || null;
}

export async function getUserPlan(clerkUserId: string) {
  const user = await getUserByClerkId(clerkUserId);
  return user?.plan || "free";
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