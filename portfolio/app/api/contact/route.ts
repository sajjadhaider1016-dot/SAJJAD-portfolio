import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid message." }, { status: 400 });
  }

  const body = data as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 100 || !emailPattern.test(email) || email.length > 254 || !subject || subject.length > 160 || !message || message.length > 5000) {
    return NextResponse.json({ error: "Check each field and try again." }, { status: 400 });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Web3Forms delivery is not configured yet. You can open a prefilled email draft instead." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject: `[Portfolio] ${subject}`,
        message,
        from_name: "Sajjad Haider Portfolio",
        botcheck: "",
      }),
    });
    const result: unknown = await response.json().catch(() => null);
    const success = typeof result === "object" && result !== null && "success" in result && result.success === true;
    if (!response.ok || !success) {
      const limited = response.status === 429;
      return NextResponse.json({ error: limited ? "The form is temporarily rate-limited. Please try again later or use the email draft." : "The message could not be delivered. Please use the email draft instead." }, { status: limited ? 429 : 502 });
    }
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Email delivery is temporarily unavailable. Please use the email draft instead." }, { status: 502 });
  }
}
