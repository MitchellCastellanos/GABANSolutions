import * as blocks from "./blocks/index.mjs";
import { joinSections } from "./html.mjs";

const BLOCK_MAP = {
  hero: blocks.hero,
  trustBar: blocks.trustBar,
  services: blocks.services,
  about: blocks.about,
  reviews: blocks.reviews,
  gallery: blocks.gallery,
  contact: blocks.contact
};

/** Renders config.layout.sectionOrder (falling back to `defaultSectionOrder`) by looking up each name in BLOCK_MAP. Unknown section names are skipped rather than throwing, so a bad edit never breaks the whole page. */
export function composeSections(config, defaultSectionOrder) {
  const order = config.layout?.sectionOrder?.length ? config.layout.sectionOrder : defaultSectionOrder;
  return joinSections(order.map((name) => {
    const block = BLOCK_MAP[name];
    return block ? block(config) : "";
  }));
}
