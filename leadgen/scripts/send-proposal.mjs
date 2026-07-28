#!/usr/bin/env node
// ============================================================
// leadgen/scripts/send-proposal.mjs
//
// The cold call is the real first touch, not this script. Once a
// prospect has both a phone number and a mockup ("Mockup Ready"),
// that's the call queue — a human calls them, says "I already made
// you one, go take a look", and logs the result as "Call Outcome".
// This script only takes over *after* that: when a human marks a
// call "Called - Interested" (see leadgen/lib/fields.mjs
// CALL_OUTCOME), it sends the actual proposal link by email as the
// follow-through on what was promised on the phone.
//
// Runs daily (Vercel Cron). Two jobs in one pass:
//
//  1. Initial send: prospects moved to "Called - Interested" (a
//     human just had a good call) get the proposal email with the
//     link, then move to "Proposal Sent".
//
//  2. Follow-ups: prospects in "Proposal Sent" who haven't
//     replied get follow-up 1 at day 3, follow-up 2 at day 7,
//     follow-up 3 at day 14 (counted from the initial send). After
//     follow-up 3, if a week passes with still no reply, the
//     prospect is archived to "No Response" and not contacted again.
//
// A prospect only leaves this loop by replying (moved manually to
// "Replied" once a human sees the reply) or by unsubscribing
// (api/unsubscribe.js sets "Do Not Contact"). Calls logged as "Not
// Interested" or "Call Back Later" never enter this script's flow —
// see leadgen/README.md for the full call-handling playbook.
//
// Usage:
//   node leadgen/scripts/send-proposal.mjs [--dry-run]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID,
// RESEND_API_KEY, LEADGEN_FROM_EMAIL, PUBLIC_SITE_URL
// (e.g. "https://gabansolutions.ca").
// ============================================================

import { fileURLToPath } from "node:url";
import { listRecords, updateRecord } from "../lib/airtable.mjs";
import { initialEmail, followUpOne, followUpTwo, followUpThree, sendEmail } from "../lib/email.mjs";
import { F, STATUS } from "../lib/fields.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const DAY_MS = 24 * 60 * 60 * 1000;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  return (Date.now() - new Date(isoDate).getTime()) / DAY_MS;
}

function contactEmailOf(fields) {
  const contact = fields[F.EMAIL] || fields[F.PHONE] || "";
  return /@/.test(contact) ? contact : null;
}

async function sendAndRecord({ record, template, fields, statusUpdate }) {
  console.log(`  -> enviando: ${template.subject} a ${fields.to}`);
  if (DRY_RUN) {
    console.log("     [dry-run] no se envía de verdad");
    return;
  }
  await sendEmail({ to: fields.to, subject: template.subject, html: template.html });
  await updateRecord(record.id, statusUpdate);
}

async function processInitialSends(siteUrl) {
  const records = await listRecords({
    filterByFormula: `AND({${F.PIPELINE_STATUS}} = "${STATUS.CALLED_INTERESTED}", {${F.PROPOSAL_LINK}} = "")`
  });
  console.log(`Envíos iniciales pendientes: ${records.length}`);

  for (const record of records) {
    const f = record.fields;
    const to = contactEmailOf(f);
    if (!to) {
      console.log(`  No email for ${f[F.NAME]}, skipping.`);
      continue;
    }
    const slug = f[F.SLUG];
    const previewUrl = `${siteUrl}/api/preview/${slug}`;
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?slug=${slug}`;
    const template = initialEmail({ businessName: f[F.NAME], previewUrl, unsubscribeUrl });
    const now = new Date().toISOString();

    await sendAndRecord({
      record,
      template,
      fields: { to },
      statusUpdate: {
        [F.PIPELINE_STATUS]: STATUS.PROPOSAL_SENT,
        [F.PROPOSAL_LINK]: previewUrl,
        [F.FIRST_EMAIL_DATE]: now,
        [F.LAST_FOLLOWUP_DATE]: now,
        [F.FOLLOWUPS_SENT]: 0
      }
    });
  }
}

async function processFollowUps(siteUrl) {
  const records = await listRecords({
    filterByFormula: `{${F.PIPELINE_STATUS}} = "${STATUS.PROPOSAL_SENT}"`
  });
  console.log(`Prospectos en seguimiento: ${records.length}`);

  for (const record of records) {
    const f = record.fields;
    const to = contactEmailOf(f);
    if (!to) continue;

    const sentCount = f[F.FOLLOWUPS_SENT] || 0;
    const daysSinceFirst = daysSince(f[F.FIRST_EMAIL_DATE]);
    const daysSinceLast = daysSince(f[F.LAST_FOLLOWUP_DATE]);
    const slug = f[F.SLUG];
    const previewUrl = f[F.PROPOSAL_LINK] || `${siteUrl}/api/preview/${slug}`;
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?slug=${slug}`;
    const businessName = f[F.NAME];
    const now = new Date().toISOString();

    if (sentCount >= 3) {
      if (daysSinceLast >= 7) {
        console.log(`  Archivando (sin respuesta): ${businessName}`);
        if (!DRY_RUN) {
          await updateRecord(record.id, { [F.PIPELINE_STATUS]: STATUS.NO_RESPONSE });
        }
      }
      continue;
    }

    const nextFollowUpDue =
      (sentCount === 0 && daysSinceFirst >= 3) ||
      (sentCount === 1 && daysSinceFirst >= 7) ||
      (sentCount === 2 && daysSinceFirst >= 14);

    if (!nextFollowUpDue) continue;

    const template = [followUpOne, followUpTwo, followUpThree][sentCount]({
      businessName,
      previewUrl,
      unsubscribeUrl
    });

    await sendAndRecord({
      record,
      template,
      fields: { to },
      statusUpdate: {
        [F.LAST_FOLLOWUP_DATE]: now,
        [F.FOLLOWUPS_SENT]: sentCount + 1
      }
    });
  }
}

export async function main() {
  const siteUrl = requireEnv("PUBLIC_SITE_URL").replace(/\/$/, "");
  await processInitialSends(siteUrl);
  await processFollowUps(siteUrl);
  console.log("Listo.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
