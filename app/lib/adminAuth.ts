import { cookies } from "next/headers";

export async function requireAdmin() {
  const cookieStore = await cookies(); // ✅ FIX HERE

  const cookie = cookieStore.get("dg_admin")?.value;

  console.log("🧪 COOKIE RAW:", cookie);

  if (!cookie) {
    console.log("❌ No cookie found");
    throw new Error("Unauthorized");
  }

  let sessionData;

  try {
    sessionData = JSON.parse(cookie);
    console.log("🧪 PARSED SESSION:", sessionData);
  } catch (err) {
    console.log("❌ JSON parse failed");
    throw new Error("Unauthorized");
  }

  if (!sessionData?.id) {
    console.log("❌ Session ID missing");
    throw new Error("Unauthorized");
  }

  console.log("✅ ADMIN AUTH PASSED");

  return sessionData;
}
