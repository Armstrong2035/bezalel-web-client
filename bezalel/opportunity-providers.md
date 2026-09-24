# Opportunity providers

The research form accepts a target and ICP, not a dataset. Choose one provider per run. No automatic fallback or provider retries are performed.

- Explorium: OPENAI_API_KEY plans filters and assesses returned evidence; EXPLORIUM_API_KEY discovers up to five profiles via /v2/prospects and researches them individually.

Explorium targets use the provider's documented revenue, size, seniority, department, and LinkedIn-industry options. The form uses multi-value selectors for these fields. Structured targets and legacy AI-planned filters share server validation before discovery. Revenue formatting and exact unions of revenue buckets are normalized; ambiguous ranges or unknown industries require correction rather than changing the requested audience. Other providers retain free-form targets.

The canonical industry snapshot is in `src/app/lib/services/exploriumOptions.mjs` (verified 2026-09-23). Sources: [v2 prospect filters](https://developers.explorium.ai/v2/prospects/fetch_prospects) and [LinkedIn categories](https://developers.explorium.ai/reference/businesses/autocomplete/linkedin_categories). Refresh the snapshot if Explorium updates its taxonomy. Tests in `tests/explorium-filters.test.mjs` cover structured/legacy request payloads, preflight rejection, revenue normalization, and readable errors for multiple invalid fields.
- Bezalel: OPENAI_API_KEY uses Responses web search to discover and research public professional profiles.
- Vibe Prospecting: OPENAI_API_KEY orchestrates its remote MCP. VIBE_ACCESS_TOKEN must be a valid OAuth access token for https://vibeprospecting.explorium.ai/mcp. The Explorium API key is not substituted. Browser OAuth connection/refresh UI is not yet implemented. Missing credentials fail before generation. Only MCP tools marked read-only are exposed; exports and bulk jobs are excluded by instruction. The provider controls sample size and billing; the app returns at most five profiles.

OPPORTUNITY_RESEARCH_MODEL defaults to gpt-4.1-mini; OPPORTUNITY_SCORING_MODEL defaults to gpt-4o-mini. All three flows use model tokens. Provider credits may also apply. Stopping cancels local work and further calls; already submitted work may still be charged.

The application streams newline-delimited JSON events: progress, person, usage, heartbeat, error, done. Completed profiles appear before the run finishes, and survive later failures. This is streaming progress and completed records, not partial provider JSON.

Verification: node --test tests/opportunity-stream.test.mjs. Tests mock all paid APIs.


Opportunity form persistence: provider, research intent, and every target field autosave to the document's `opportunityForm` field through the authenticated `PUT /api/documents/[docId]/opportunity-form` endpoint. Saves are debounced by 600 ms and serialized per document. Existing document reads restore the form without another request. Empty and unfinished drafts are retained; research validation still happens before a run.

Each edit also backs up the draft in localStorage under a versioned user/document key. Pending drafts take precedence on refresh and retry when the form opens or the browser comes online. Successful saves remove the backup. The form shows saving, saved, and retry states, including when local storage is unavailable. Navigation flushes pending work; refresh recovery relies on the synchronous local backup if the browser cancels the network request. Concurrent tabs/devices use last-write-wins; live collaborative form merging is not implemented. Research results and running jobs are not part of this saved form.

Persistence verification: `node --test tests/opportunity-form.test.mjs` covers restoration, blank fields, account/document separation, unavailable storage, failed-save retry, in-flight edits, and authenticated document write routing with mocked storage.
