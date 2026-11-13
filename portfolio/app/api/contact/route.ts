import { NextResponse } from "next/server";

const noStore = { "Cache-Control": "no-store" };

/**
 * Web3Forms access keys are public form identifiers. Serve the configured key
 * to the browser so submissions go directly to Web3Forms, as required by its
 * API's browser-origin and anti-abuse checks.
 */
export async function GET() {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();

  if (!accessKey) {
    return NextResponse.json(
      { error: "Online contact delivery is not configured." },
      { status: 503, headers: noStore },
    );
  }

  return NextResponse.json({ accessKey }, { headers: noStore });
}
