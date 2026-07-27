#!/usr/bin/env node
// ============================================================
// leadgen/scripts/send-proposal.mjs
//
// Runs daily (Vercel Cron). Two jobs in one pass:
//
//  1. Initial send: prospects in "Mockup listo" (a human uploaded
//     the mockup to Airtable) get the first outreach email, then
//     move to "Propuesta enviada".
//
//  2. Follow-ups: prospects in "Propuesta enviada" who haven't
//     replied get follow-up 1 at day 3, follow-up 2 at day 7,
//     follow-up 3 at day 14 (counted from the initial send). After
//     follow-up 3, if a week passes with still no reply, the
//     prospect is archived to "Sin respuesta" and not contacted again.
//
// A prospect only leaves this loop by replying (moved manually to
// "Respondió" once a human sees the reply) or by unsubscribing
// (api/unsubscribe.js sets "No contactar").
//
// Usage:
//   node leadgen/scripts/send-proposal.mjs [--dry-run]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID,
// RESEND_API_KEY, LEADGEN_FROM_EMAIL, PUBLIC_SITE_URL
// (e.g. "https://gabansolutions.ca").
// ============================================================

import { listRecords, updateRecord } from "../lib/airtable.mjs";
import { initialEmail, followUpOne, followUpTwo, followUpThree, sendEmail } from "../lib/email.mjs";

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
  const contact = fields["Email"] || fields["Teléfono"] || "";
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
    filterByFormula: `AND({Estado del pipeline} = "Mockup listo", {Link a la propuesta} = "")`
  });
  console.log(`Envíos iniciales pendientes: ${records.length}`);

  for (const record of records) {
    const f = record.fields;
    const to = contactEmailOf(f);
    if (!to) {
      console.log(`  Sin email para ${f["Nombre"]}, no se puede enviar automáticamente. Saltando.`);
      continue;
    }
    const slug = f["Slug"];
    const previewUrl = `${siteUrl}/api/preview/${slug}`;
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?slug=${slug}`;
    const template = initialEmail({ businessName: f["Nombre"], previewUrl, unsubscribeUrl });
    const now = new Date().toISOString();

    await sendAndRecord({
      record,
      template,
      fields: { to },
      statusUpdate: {
        "Estado del pipeline": "Propuesta enviada",
        "Link a la propuesta": previewUrl,
        "Fecha de primer email": now,
        "Fecha de último follow-up": now,
        "# de follow-ups enviados": 0
      }
    });
  }
}

async function processFollowUps(siteUrl) {
  const records = await listRecords({
    filterByFormula: `{Estado del pipeline} = "Propuesta enviada"`
  });
  console.log(`Prospectos en seguimiento: ${records.length}`);

  for (const record of records) {
    const f = record.fields;
    const to = contactEmailOf(f);
    if (!to) continue;

    const sentCount = f["# de follow-ups enviados"] || 0;
    const daysSinceFirst = daysSince(f["Fecha de primer email"]);
    const daysSinceLast = daysSince(f["Fecha de último follow-up"]);
    const slug = f["Slug"];
    const previewUrl = f["Link a la propuesta"] || `${siteUrl}/api/preview/${slug}`;
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?slug=${slug}`;
    const businessName = f["Nombre"];
    const now = new Date().toISOString();

    if (sentCount >= 3) {
      if (daysSinceLast >= 7) {
        console.log(`  Archivando (sin respuesta): ${businessName}`);
        if (!DRY_RUN) {
          await updateRecord(record.id, { "Estado del pipeline": "Sin respuesta" });
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
        "Fecha de último follow-up": now,
        "# de follow-ups enviados": sentCount + 1
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
