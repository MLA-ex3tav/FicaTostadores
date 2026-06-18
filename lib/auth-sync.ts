import type { User } from "firebase/auth";
import { syncAuthSessionClient } from "@/lib/auth-sync-client";

export async function syncAuthSession(
  user: User,
): Promise<{ isAdmin: boolean }> {
  return syncAuthSessionClient(user);
}
