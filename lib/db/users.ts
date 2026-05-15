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