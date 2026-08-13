// Single serverless entry for all /api/admin/* routes (Hobby plan function limit).
// Handler implementations live in admin/lib/handlers/, outside api/, because
// Vercel's zero-config Node builder counts every .js/.mjs file directly under
// api/ as its own Serverless Function — regardless of whether anything else
// imports it. With the Hobby plan's 12-function cap, keeping handler/lib code
// under api/admin/ blew the budget (see the "exceeded_serverless_functions_
// per_deployment" build error) as soon as the blog admin handlers were added.

import { handleCheck } from "../../admin/lib/handlers/check.mjs";
import { handleBookingsList } from "../../admin/lib/handlers/bookings-list.mjs";
import { handleBookingsCancel } from "../../admin/lib/handlers/bookings-cancel.mjs";
import { handleBookingsAdd } from "../../admin/lib/handlers/bookings-add.mjs";
import { handleBlogList } from "../../admin/lib/handlers/blog-list.mjs";
import { handleBlogContent } from "../../admin/lib/handlers/blog-content.mjs";
import { handleBlogSave } from "../../admin/lib/handlers/blog-save.mjs";
import { handleBlogValidate } from "../../admin/lib/handlers/blog-validate.mjs";
import { handleAnalytics } from "../../admin/lib/handlers/analytics.mjs";

function extractPath(query) {
  const raw = query?.["...path"] ?? query?.path;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return raw.split("/").filter(Boolean);
  return [];
}

export default async function handler(req, res) {
  const segments = extractPath(req.query);
  const route = segments.join("/");

  if (route === "check") {
    return handleCheck(req, res);
  }
  if (route === "bookings/list") {
    return handleBookingsList(req, res);
  }
  if (route === "bookings/cancel") {
    return handleBookingsCancel(req, res);
  }
  if (route === "bookings/add") {
    return handleBookingsAdd(req, res);
  }
  if (route === "blog/list") {
    return handleBlogList(req, res);
  }
  if (route === "blog/content") {
    return handleBlogContent(req, res);
  }
  if (route === "blog/save") {
    return handleBlogSave(req, res);
  }
  if (route === "blog/validate") {
    return handleBlogValidate(req, res);
  }
  if (route === "analytics") {
    return handleAnalytics(req, res);
  }

  return res.status(404).json({ ok: false, error: "Not found" });
}
