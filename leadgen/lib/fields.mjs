// ============================================================
// Airtable field names + pipeline status values (English).
// Keep these in sync with the Prospects table schema.
// ============================================================

export const F = {
  NAME: "Name",
  PHONE: "Phone",
  EMAIL: "Email",
  WEBSITE: "Website",
  CATEGORY: "Category",
  CITY: "City",
  ADDRESS: "Address",
  RATING: "Rating",
  REVIEW_COUNT: "Review Count",
  BUSINESS_STATUS: "Business Status",
  GOOGLE_PLACE_ID: "Google Place ID",
  SLUG: "Slug",
  SITE_AUDIT_JSON: "Site Audit JSON",
  SCORE: "Score",
  BUCKET: "Bucket",
  SIGNALS: "Signals",
  PIPELINE_STATUS: "Pipeline Status",
  MOCKUP_LINK: "Mockup Link",
  PROPOSAL_LINK: "Proposal Link",
  FIRST_VIEWED: "First Viewed",
  FIRST_EMAIL_DATE: "First Email Date",
  LAST_FOLLOWUP_DATE: "Last Follow-up Date",
  FOLLOWUPS_SENT: "Follow-ups Sent",
  CALL_DATE: "Call Date",
  CALL_OUTCOME: "Call Outcome",
  CALL_NOTES: "Call Notes"
};

export const STATUS = {
  PROSPECTED: "Prospected",
  QUALIFIED: "Qualified",
  MOCKUP_READY: "Mockup Ready",
  CALLED_INTERESTED: "Called - Interested",
  CALL_BACK_LATER: "Call Back Later",
  NOT_INTERESTED: "Not Interested",
  PROPOSAL_SENT: "Proposal Sent",
  REPLIED: "Replied",
  NO_RESPONSE: "No Response",
  DISCARDED: "Discarded",
  DO_NOT_CONTACT: "Do Not Contact"
};

// Options for the "Call Outcome" single select — the human sets this by
// hand right after the cold call. Kept separate from STATUS because a
// call can be logged without necessarily changing the pipeline stage
// (e.g. "Call Back Later" leaves the prospect in the call queue).
export const CALL_OUTCOME = {
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not interested",
  NO_ANSWER: "No answer",
  VOICEMAIL: "Voicemail",
  CALL_BACK: "Asked to call back"
};
