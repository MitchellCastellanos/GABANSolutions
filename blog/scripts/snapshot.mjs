// Run with Airtable credentials after publishing/unpublishing, then commit
// the snapshot and deploy. Failure leaves the previous snapshot untouched.
import { writeFile } from "node:fs/promises";
import { listRecords } from "../lib/airtable.mjs";
import { F, POST_STATUS } from "../lib/fields.mjs";

const records = await listRecords({ filterByFormula: `{${F.STATUS}} = "${POST_STATUS.PUBLISHED}"` });
const publicFields = Object.values(F).filter(f => f !== F.VIEWS && f !== F.LAST_VIEWED);
const published = records.filter(r => r.fields[F.STATUS] === POST_STATUS.PUBLISHED && r.fields[F.SLUG])
  .map(r => ({ fields: Object.fromEntries(publicFields.filter(f => r.fields[f] !== undefined).map(f => [f, r.fields[f]])) }));
await writeFile(new URL("../data/published.json", import.meta.url), JSON.stringify({ exportedAt: new Date().toISOString(), records: published }, null, 2) + "\n");
console.log(`Saved ${published.length} published articles.`);
