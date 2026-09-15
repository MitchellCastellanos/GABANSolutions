import snapshot from "../data/published.json" with { type: "json" };
import { listRecords } from "./airtable.mjs";
import { F, POST_STATUS } from "./fields.mjs";

const REFRESH_MS = 60 * 60 * 1000;

// One refresh per warm function instance, including concurrent requests and
// failed refreshes. The committed snapshot also survives cold starts/outages.
export function createPublishedReader({ read = listRecords, backup = snapshot.records, now = Date.now } = {}) {
  let records = backup;
  let nextRefresh = 0;
  let pending;
  let stale = true;
  return async function readPublished() {
    if (now() >= nextRefresh && !pending) {
      pending = (async () => {
        try {
          const fresh = await read({ filterByFormula: `{${F.STATUS}} = "${POST_STATUS.PUBLISHED}"` });
          // Replace, never merge: a successful unpublish must remove the post.
          records = fresh.filter(r => r.fields[F.STATUS] === POST_STATUS.PUBLISHED && r.fields[F.SLUG]);
          stale = false;
        } catch (err) {
          stale = true;
          console.warn("[blog] Serving published backup:", err.message);
        } finally {
          nextRefresh = now() + REFRESH_MS;
        }
      })();
    }
    if (pending) {
      const refresh = pending;
      await refresh;
      if (pending === refresh) pending = undefined;
    }
    return { records, stale };
  };
}

export const readPublished = createPublishedReader();

export function cachePublicResponse(res) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
}
