import { NextResponse } from "next/server";

const GOOGLE_REVIEW_URL =
  "https://g.page/r/Cc9a8U1h6aPlEBM/review";

export function GET() {
  return NextResponse.redirect(
    GOOGLE_REVIEW_URL
  );
}