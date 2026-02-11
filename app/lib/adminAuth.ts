import { cookies } from "next/headers";

export type AdminRole = "super" | "staff";

export async function requireAdmin(): Promise<AdminRole> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("dg_admin");

  if (!adminCookie) {
    throw new Error("UNAUTHORIZED");
  }

  const value = adminCookie.value;

  // Future-proof parsing
  if (value === "authorized:super") return "super";
  if (value === "authorized:staff") return "staff";

  // Backward compatibility
  if (value === "authorized") return "staff";

  throw new Error("UNAUTHORIZED");
}
