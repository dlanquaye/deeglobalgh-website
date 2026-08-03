import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/adminAuth";
import { synchronizeCatalog } from "@/lib/catalog-sync";

export async function POST(req: Request) {
  await requireAdmin();

  const { syncItems } = await req.json();

  const report = await synchronizeCatalog(syncItems, false);

  return NextResponse.json({
    success: true,
    report,
  });
}