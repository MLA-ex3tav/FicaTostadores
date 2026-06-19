import type { User } from "firebase/auth";
import { syncAuthSessionClient } from "@/lib/auth-sync-client";
import type { UserRole } from "@/lib/permissions";

export async function syncAuthSession(
  user: User,
): Promise<{ role: UserRole | null; isStaff: boolean; isAdmin: boolean }> {
  return syncAuthSessionClient(user);
}
