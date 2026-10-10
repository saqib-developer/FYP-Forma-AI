import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export interface SyncUserResponse {
  id: number;
  name: string;
  email: string;
  credits: number | null;
}

export async function syncUser(fullName: string | null, email: string): Promise<SyncUserResponse> {
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!users.length) {
    const res = await db.insert(usersTable).values({
      name: fullName ?? "",
      email: email,
    }).returning();

    return res[0] as SyncUserResponse;
  }

  return users[0] as SyncUserResponse;
}
