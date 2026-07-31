// Email copy for the booking calendar. Kept separate from
// leadgen/lib/email.mjs because these are transactional confirmations
// tied to an action the recipient just took, not cold outreach.

function footer() {
  return `
    <hr style="margin:2rem 0;border:none;border-top:1px solid #e5e5e5;">
    <p style="font-size:0.8rem;color:#888;">GABAN Solutions — Montreal, QC, Canada · hello@gabansolutions.ca</p>`;
}

export function clientConfirmationEmail({ name, dateLabel, timeLabel, timezoneLabel, notes }) {
  return {
    subject: `Confirmed: your free consultation with GABAN Solutions — ${dateLabel} at ${timeLabel}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your free consultation is confirmed for:</p>
      <p style="font-size:1.1rem;font-weight:600;">${dateLabel} at ${timeLabel} (${timezoneLabel})</p>
      <p>We'll call you at the number/contact you provided, or you're welcome to reply to this email with a preferred method (phone, WhatsApp, video call).</p>
      ${notes ? `<p><strong>What you told us:</strong> ${notes}</p>` : ""}
      <p>Need to reschedule? Just reply to this email.</p>
      <p>Talk soon,<br>GABAN Solutions</p>
      ${footer()}`
  };
}

export function ownerNotificationEmail({ name, email, phone, business, notes, dateLabel, timeLabel, timezoneLabel }) {
  return {
    subject: `New booking: ${name} — ${dateLabel} at ${timeLabel}`,
    html: `
      <p>New free-consultation booking from the site:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone || "-"}</li>
        <li><strong>Business:</strong> ${business || "-"}</li>
        <li><strong>When:</strong> ${dateLabel} at ${timeLabel} (${timezoneLabel})</li>
        <li><strong>Notes:</strong> ${notes || "-"}</li>
      </ul>`
  };
}
