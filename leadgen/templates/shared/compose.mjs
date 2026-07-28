import * as blocks from "./blocks/index.mjs";
import { joinSections } from "./html.mjs";

const BLOCK_MAP = {
  hero: blocks.hero,
  trustBar: blocks.trustBar,
  services: blocks.services,
  about: blocks.about,
  reviews: blocks.reviews,
  gallery: blocks.gallery,
  contact: blocks.contact,
  pageHeader: blocks.pageHeader
};

/**
 * Renders a page's sections by looking up each name in BLOCK_MAP.
 * Unknown section names are skipped rather than throwing, so a bad
 * edit never breaks the whole page.
 *
 * `page` is the current page's entry from config.pages (multi-page
 * configs) — or, for a legacy single-page config with no `pages` key,
 * `page` is just `config` itself, since the old shape already has
 * `content`/`layout` directly on it. Every block reads from `page`,
 * not `config`, for exactly this reason.
 */
export function composeSections(config, page, defaultSectionOrder) {
  const order = (page?.sectionOrder?.length && page.sectionOrder)
    || (page?.layout?.sectionOrder?.length && page.layout.sectionOrder)
    || defaultSectionOrder;
  return joinSections(order.map((name) => {
    const block = BLOCK_MAP[name];
    return block ? block(config, page) : "";
  }));
}
