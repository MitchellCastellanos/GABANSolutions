// Single serverless entry for all /api/admin/* routes (Hobby plan function limit).

import { handleCheck } from "./handlers/check.mjs";
import { handleBookingsList } from "./handlers/bookings-list.mjs";
import { handleBookingsCancel } from "./handlers/bookings-cancel.mjs";
import { handleBookingsAdd } from "./handlers/bookings-add.mjs";
import { handleBlogList } from "./handlers/blog-list.mjs";
import { handleBlogContent } from "./handlers/blog-content.mjs";
import { handleBlogSave } from "./handlers/blog-save.mjs";
import { handleBlogValidate } from "./handlers/blog-validate.mjs";

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

  return res.status(404).json({ ok: false, error: "Not found" });
}
