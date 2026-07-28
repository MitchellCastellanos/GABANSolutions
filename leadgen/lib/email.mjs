// ============================================================
// Resend client + outbound email templates.
//
// All templates end with the CASL-required footer: clear sender
// identification (name + mailing address) and a working unsubscribe
// link. This is not optional for a Canada-based business sending
// commercial electronic messages — see Canada's Anti-Spam Law.
//
// Required env vars: RESEND_API_KEY, LEADGEN_FROM_EMAIL
// (e.g. "GABAN Solutions <hello@gabansolutions.ca>").
// ============================================================

const RESEND_API_URL = "https://api.resend.com/emails";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function caslFooter(unsubscribeUrl) {
  return `
    <hr style="margin:2rem 0;border:none;border-top:1px solid #e5e5e5;">
    <p style="font-size:0.8rem;color:#888;">
      GABAN Solutions — Montreal, QC, Canada · hello@gabansolutions.ca<br>
      You're receiving this because your business showed up in a public
      Google Maps search we ran for local businesses that might want a
      website refresh. Not interested?
      <a href="${unsubscribeUrl}">Unsubscribe</a>.
    </p>`;
}

export function initialEmail({ businessName, previewUrl, unsubscribeUrl }) {
  return {
    subject: `A working preview of a new website for ${businessName}`,
    html: `
      <p>Hi,</p>
      <p>Like I mentioned on the phone — I came across <strong>${businessName}</strong>
      on Google Maps and put together a real, working preview of what a new
      website could look like for you. It's live, you can open it and click around:</p>
      <p><a href="${previewUrl}">${previewUrl}</a></p>
      <p>No pricing, no obligation — just wanted you to see it for real.
      If it's interesting, do you have 15 minutes this week to talk it through?</p>
      <p>— GABAN Solutions</p>
      ${caslFooter(unsubscribeUrl)}`
  };
}

export function followUpOne({ businessName, previewUrl, unsubscribeUrl }) {
  return {
    subject: `Following up — ${businessName}`,
    html: `
      <p>Hi again,</p>
      <p>Just following up in case my last email got buried — here's the
      live preview for <strong>${businessName}</strong> again, you can open
      it and browse it like a real site:</p>
      <p><a href="${previewUrl}">${previewUrl}</a></p>
      <p>Happy to chat for 15 minutes whenever works for you.</p>
      <p>— GABAN Solutions</p>
      ${caslFooter(unsubscribeUrl)}`
  };
}

export function followUpTwo({ businessName, previewUrl, unsubscribeUrl }) {
  return {
    subject: `One more thing — ${businessName}`,
    html: `
      <p>Hi,</p>
      <p>One thing worth mentioning: most people now find local
      businesses on their phone first. A site that isn't fast and
      mobile-friendly quietly loses potential customers before they
      even reach out.</p>
      <p>Here's the preview again for <strong>${businessName}</strong>
      in case it's useful: <a href="${previewUrl}">${previewUrl}</a></p>
      <p>No pressure — just let me know if a quick call makes sense.</p>
      <p>— GABAN Solutions</p>
      ${caslFooter(unsubscribeUrl)}`
  };
}

export function followUpThree({ businessName, previewUrl, unsubscribeUrl }) {
  return {
    subject: `Last note — ${businessName}`,
    html: `
      <p>Hi,</p>
      <p>I'll leave it here for now so I'm not clogging your inbox. If
      priorities change and a new site for <strong>${businessName}</strong>
      becomes worth exploring, the preview is still here:
      <a href="${previewUrl}">${previewUrl}</a></p>
      <p>Feel free to reach out any time — I'm around.</p>
      <p>— GABAN Solutions</p>
      ${caslFooter(unsubscribeUrl)}`
  };
}

export async function sendEmail({ to, subject, html }) {
  const apiKey = requireEnv("RESEND_API_KEY");
  const from = requireEnv("LEADGEN_FROM_EMAIL");

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
  return res.json();
}
