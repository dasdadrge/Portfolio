// Contact form endpoint. Talks to the Resend REST API directly with fetch — no SDK to
// install, and nothing to keep in sync. The API key never reaches the browser: this runs
// on the server and the static form in /public only POSTs to it.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Resend's shared sender, usable without a verified domain. It can only deliver to the
// address that owns the Resend account, which is exactly what CONTACT_TO_EMAIL is.
const FROM = "Portfolio <onboarding@resend.dev>";

const MAX = { name: 100, email: 200, message: 4000 };

function bad(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  // Trimmed: pasting into a dashboard field easily carries a trailing space or newline,
  // and Resend rejects the key outright when it does.
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !to) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return bad("The contact form is not configured yet.", 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Malformed request.");
  }

  // Honeypot: a real person never fills a field they cannot see. Answer 200 so a bot
  // cannot tell it was rejected.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) return bad("Please fill in every field.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("That email address looks wrong.");
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return bad("That message is too long.");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      // So hitting Reply in the inbox answers the visitor, not Resend.
      reply_to: email,
      subject: `Portfolio — ${name}`,
      text: `${name} <${email}>\n\n${message}`,
      html:
        `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>` +
        `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend rejected the message:", response.status, detail);
    // TEMPORARY: surface Resend's own reason so the failure can be diagnosed without
    // access to the runtime logs. Remove once the delivery path is confirmed.
    return Response.json(
      { ok: false, error: "Could not send the message. Try emailing me directly.", debug: { status: response.status, detail } },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
