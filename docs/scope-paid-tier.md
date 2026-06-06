# Stereoscope Paid Tier — Scoping Document

**Status:** Draft for review. Nothing in this document has been implemented.
**Owner:** echew75
**Last updated:** 2026-06-06

---

## 1. Executive Summary

Three-tier subscription model gated by Supabase Auth, metered against a `analysis_usage` table, billed through Stripe. Free tier seeds the screener; paid tiers fund the Gemini bill.

| Tier | Price | Fresh analyses / mo | Includes |
|---|---|---|---|
| Free | $0 | 3 | Screener, cached reports, methodology, session-only journal |
| Researcher | $9 / mo | 15 | + cross-device journal sync + commitment tracking |
| Pro | $19 / mo | Unlimited | + force-refresh + (future) email alerts + (future) comparison mode |

**Effort estimate:** 5–7 focused engineering days end-to-end.
**Recurring fixed cost** before any users: ~$50–70/mo.
**Gross margin** at typical usage: 50–85%.

---

## 2. Tier Specification

### 2.1 Free
- Read any cached report (via direct ticker URL or screener)
- Browse `/screener` and `/methodology`
- 3 fresh analyses per calendar month
- Journal works in-page but does not persist across devices or sessions
- No email alerts, no comparison, no force-refresh

### 2.2 Researcher · $9 / month
- Everything in Free
- 15 fresh analyses per calendar month
- Journal syncs to the user's account, accessible from any device
- Commitments persist and can be reviewed across all watched tickers
- No force-refresh button (cache controls when reports update)

### 2.3 Pro · $19 / month
- Everything in Researcher
- Unlimited fresh analyses
- Force-refresh button (forces a fresh Gemini run even when cache is warm)
- (Roadmap) Email when an invalidation trigger fires
- (Roadmap) Side-by-side comparison of two tickers
- (Roadmap) Priority Gemini queue if we ever hit rate limits

### 2.4 Grace credits

New accounts get **+5 grace analyses in the first calendar month** on top of their tier cap. Designed to remove friction from initial exploration. After month one, no carryover.

### 2.5 Carryover policy

**Unused credits do not roll over.** Reset on the 1st of each calendar month. Stated explicitly in UI copy ("Your 15 analyses reset on the 1st").

---

## 3. Authentication

### 3.1 Provider

**Supabase Auth** — already in the project. No new vendor.

### 3.2 Methods

- Email + password
- Google OAuth

Two methods cover ~95% of users without the complexity of magic links, GitHub OAuth, or passkeys. Add more later if user research demands it.

### 3.3 Account fields (new columns on `auth.users` metadata or a new `profiles` table)

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Inherited from `auth.users` |
| `email` | text | Inherited |
| `tier` | text | `'free' \| 'researcher' \| 'pro'` |
| `stripe_customer_id` | text | nullable |
| `stripe_subscription_id` | text | nullable |
| `tier_active_until` | timestamptz | when the current paid period expires |
| `grace_credits_used` | int | for the first-month bonus tracking |
| `created_at` | timestamptz | for grace-period logic |

### 3.4 Signed-out vs signed-in UX

- **Public routes (no auth required):** `/`, `/screener`, `/methodology`, any cached `/[ticker]` report read via `/api/report/[ticker]`.
- **Auth required:** triggering a fresh analysis (`/api/analyze`), force-refresh, journal sync.
- **Anonymous users** retain the current "session-only" journal so they can write notes within a session but lose them on reload. Acts as a soft upgrade nudge.

### 3.5 Sign-up flow

1. User hits a paywalled action (e.g. clicks "Analyse" past their session quota of 0).
2. Modal: "Create a free account to run 3 analyses a month." Email or Google.
3. After signup, automatic redirect back to the originally-attempted action with the analysis kicked off immediately.

### 3.6 Email verification

**Required** for free accounts before they can trigger their first analysis. Prevents disposable-email abuse of the 3 free + 5 grace = 8 analyses available per account in month one. Use Supabase's built-in verification flow — no new infrastructure.

### 3.7 Route protection

Implement via middleware in `middleware.ts` (Next.js 16):

```
/api/analyze → require auth + check cap
/api/journal (write paths) → require auth + check tier
/account/* → require auth
```

Public read endpoints remain unguarded.

---

## 4. Usage Table

### 4.1 Schema

```sql
create table analysis_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  type text not null check (type in ('initial', 'refresh')),
  charged_at timestamptz not null default now(),
  was_grace boolean not null default false
);

create index idx_analysis_usage_user_month
  on analysis_usage (user_id, charged_at desc);
```

### 4.2 Insert point

In `app/api/analyze/route.ts`, inside the existing `bothScoutsOk` cache-write branch:

```ts
if (bothScoutsOk && userId) {
  await supabase.from("analysis_usage").insert({
    user_id: userId,
    ticker: normalizedTicker,
    type: force ? "refresh" : "initial",
    was_grace: gracePeriodActive,
  });
}
```

This means **failed analyses, partial-failure analyses, and cached reads are never charged**. The billing rule and the cache-write rule are the same condition.

### 4.3 Cap check (pre-analysis)

```ts
const monthStart = firstOfMonthUTC();
const { count } = await supabase
  .from("analysis_usage")
  .select("*", { count: "exact", head: true })
  .eq("user_id", userId)
  .gte("charged_at", monthStart.toISOString());

const cap = tierCap(userTier) + graceCreditsRemaining(user);
if (count >= cap) {
  return Response.json({
    success: false,
    error: "cap_reached",
    currentCount: count,
    cap,
    suggestedTier: userTier === "free" ? "researcher" : "pro",
  }, { status: 402 });
}
```

### 4.4 Hard abuse cap

Independent of the tier-credit logic, **no user can trigger more than 60 analysis attempts per month** regardless of success/failure. Protects against pathological retry loops. Researcher would basically never hit this.

### 4.5 Row-level security

```sql
alter table analysis_usage enable row level security;
create policy "users see their own usage" on analysis_usage
  for select using (auth.uid() = user_id);
-- Inserts only from service role (the analyze endpoint runs as service role)
```

---

## 5. Credit Meter UI

### 5.1 Location

Two surfaces:

- **Persistent chip in the Masthead** when authenticated: `"⚡ 8 / 15"` clicking opens the usage detail modal.
- **In-context warning at 80% of cap** (e.g. 12/15): inline nudge under the "Analyse a ticker" search bar that says *"3 analyses left this month — Upgrade to Pro for unlimited"*.
- **Cap modal at 15/15** when the user attempts another analysis: full-screen modal with the upgrade CTA and a "back to screener" secondary action.

### 5.2 States

| Usage | Meter colour | Side text |
|---|---|---|
| 0–60% (0–9 of 15) | Default ink | — |
| 60–80% (10–12) | Gold | "Running low" |
| 80–100% (13–15) | Bear red | "Upgrade for unlimited →" |
| Over cap | Bear red, locked | Modal blocks new analyses |

### 5.3 Failure visual

When an analysis fails (LensFailurePanel renders), the meter does not change. To make that obvious, render a toast: *"No credit charged — try again."* Toast disappears after 5s.

### 5.4 Mobile

The meter chip collapses to just the numerator on screens <600px: `"⚡ 8"`. Tap reveals the full detail panel.

### 5.5 Pro users

The meter shows `"⚡ Unlimited"` and is non-interactive. No nudges, no warnings.

---

## 6. Stripe Integration

### 6.1 Products & prices

In Stripe Dashboard, create:

- **Product: Stereoscope Researcher**
  - Price: $9.00 USD recurring monthly
  - (Optional) Annual price: $90 USD recurring yearly (save $18)
- **Product: Stereoscope Pro**
  - Price: $19.00 USD recurring monthly
  - (Optional) Annual price: $190 USD recurring yearly (save $38)

### 6.2 Checkout flow

1. User clicks upgrade CTA → server creates a Stripe Checkout Session for the chosen price.
2. Session redirect URL includes `customer_id` so we can reconcile on return.
3. Success URL: `/account/subscription?status=success&session_id={CHECKOUT_SESSION_ID}` — server verifies session and updates user's `tier`.
4. Cancel URL: `/account/subscription?status=cancelled`.

### 6.3 Webhook handling

Endpoint: `POST /api/stripe-webhook`. Handles these events:

| Event | What we do |
|---|---|
| `customer.subscription.created` | Set user's `tier` and `tier_active_until` |
| `customer.subscription.updated` | Update tier / status |
| `customer.subscription.deleted` | Downgrade to free immediately |
| `invoice.payment_failed` | Email user, grace period 3 days, then downgrade |
| `invoice.payment_succeeded` | Extend `tier_active_until` |

**Signature verification is mandatory.** Use Stripe's `constructEvent` with the webhook secret from env. A misconfigured webhook is the #1 way Stripe integrations get exploited.

### 6.4 Customer portal

Stripe's hosted billing portal handles cancellations, payment-method updates, and invoice downloads. We pass the customer to it via a server-side `createPortalSession` call. No PCI scope on our side.

### 6.5 Idempotency

All POST handlers that mutate billing state (webhook, checkout-completed) accept an idempotency key and short-circuit if we've already processed the same event ID. Stripe occasionally redelivers webhooks.

### 6.6 What we never store

- Card numbers
- CVV
- Card expiry dates
- Full billing address (Stripe stores it; we only pull country if we need it for VAT)

This keeps Stereoscope in **PCI SAQ-A scope** — the simplest possible compliance level — for as long as we use Stripe Checkout and never touch a card form ourselves.

---

## 7. Costing

### 7.1 Per-analysis variable cost (Gemini 2.5 Flash)

Rough numbers from current public pricing (verify before launch):

- Input tokens: ~$0.075 / 1M
- Output tokens: ~$0.30 / 1M
- Grounded search: small surcharge per call (~$0.035 per call last I checked)

A typical Stereoscope analysis sends ~5k input tokens × 3 calls and produces ~3k output tokens × 3 calls, plus 2 grounded-search calls. So:

- Input: ~15k tokens × $0.075/M = $0.001
- Output: ~9k tokens × $0.30/M = $0.003
- Search: 2 × $0.035 = $0.07
- **Total ≈ $0.07 per analysis** (rounded up to $0.10 to be safe; doubles to ~$0.20 in the ~20% retry case)

> **⚠ Sanity-check this number before launch.** Gemini pricing changes; my training data may be stale.

### 7.2 Fixed monthly costs (rough)

| Item | Cost | Notes |
|---|---|---|
| Vercel Pro (production) | $20 | Sufficient for first ~10k MAU |
| Supabase Pro | $25 | Free tier OK if <500 MAU; Pro for production |
| Domain | $1.25 | Amortised from ~$15/yr |
| Stripe | $0 base | Per-transaction fees only |
| Email (Resend free tier) | $0 | Free up to 3k emails/mo |
| Sentry (free tier) | $0 | Free for <5k errors/mo |
| **Subtotal** | **~$46/mo** | Plus variable Gemini + Stripe transaction fees |

At scale add:
- Sentry Team: $26/mo (>5k errors)
- Resend paid: $20/mo (>3k emails)
- Vercel bandwidth overage: variable
- Supabase Pro database compute add-ons: variable

### 7.3 Stripe transaction fees

- 2.9% + $0.30 per successful charge (US standard rate)
- Researcher at $9: Stripe takes $0.56 → net $8.44
- Pro at $19: Stripe takes $0.85 → net $18.15

For non-US payment methods or international cards, add ~1.5%. For currency conversion, another 1%.

### 7.4 Unit economics

**Researcher tier**, typical user, 8 analyses/month:
- Revenue net of Stripe: $8.44
- Gemini cost: 8 × $0.10 = $0.80 (or $1.60 worst-case with retries)
- **Gross margin: ~80%**

**Researcher tier**, heavy user, 15 analyses/month:
- Revenue net: $8.44
- Gemini cost: 15 × $0.10 = $1.50 ($3.00 worst-case)
- **Gross margin: 65-82%**

**Pro tier**, typical user, 25 analyses/month:
- Revenue net: $18.15
- Gemini cost: 25 × $0.10 = $2.50 ($5.00 worst-case)
- **Gross margin: 72-86%**

**Pro tier**, heavy user, 80 analyses/month (suspiciously power-using):
- Revenue net: $18.15
- Gemini cost: 80 × $0.10 = $8.00 ($16.00 worst-case)
- **Gross margin: 12-56%** — concerning at the worst case

> If the 80-analysis Pro user becomes common, raise prices or introduce a soft cap with overage billing. Don't preemptively design for them; monitor instead.

### 7.5 Break-even

At ~$50/mo fixed costs and an average net revenue of $14/user (mixed Researcher/Pro), break-even is ~**4 paying users**. At ~50 paying users you're contributing meaningfully to compute costs and any salary draws.

---

## 8. Security: Personal Data

### 8.1 Data minimisation

Stereoscope collects only:
- Email (auth)
- Hashed password (Supabase manages)
- OAuth provider ID if applicable
- Stripe customer ID
- Journal text (user-generated, encrypted at rest)
- Usage logs (analyses run)
- IP address (transient, for rate limiting only — not stored beyond 30 days)

We do **not** collect:
- Real name (unless user volunteers)
- Phone number
- Physical address (Stripe collects for billing, we don't store it)
- Browsing behaviour beyond what's logged in `analysis_usage`

### 8.2 Storage and encryption

- **At rest:** Supabase Postgres uses AES-256 encryption at rest by default.
- **In transit:** All traffic over TLS 1.2+. Force HTTPS at the Vercel edge.
- **Backups:** Supabase Pro includes daily backups with 7-day retention. Enable on launch.

### 8.3 Row-Level Security

Every table that contains user-specific data uses RLS:

```sql
-- analysis_usage: users see only their own
-- journals: users see only their own
-- reports: read by anyone (the cache is shared)
-- profiles: users see only their own
```

The `reports` table being public-read is **deliberate** — it's the screener's data source. No PII lives there. Confirm this by inspecting the columns: ticker, report_data (JSON), filing_period, filing_date, gemini_model, expires_at, created_at. None of these are user-attributable.

### 8.4 GDPR / data deletion

**Right to erasure:** an `/account/delete` endpoint that:
1. Removes all rows in `analysis_usage`, `journals`, `profiles` for the user
2. Calls `auth.admin.deleteUser(userId)` via Supabase service role
3. Cancels Stripe subscription via API
4. Anonymises any retained data (e.g. webhook logs)

**Right of access:** `/account/export` endpoint that returns a JSON dump of the user's data (their journals, usage history, profile).

**Data residency:** Supabase regions are explicit per project. Pick a region appropriate for your primary market and document it in the Privacy Policy. (Singapore for Asia, US-East for Americas, EU-West for Europe.)

### 8.5 Privacy Policy and Terms of Service

**Mandatory before charging anyone.** Must explicitly state:
- What we collect and why
- How long we retain it
- Who we share with (Stripe, Vercel, Supabase, Google Gemini — be specific)
- Cookie policy (we use first-party auth cookies; declare them)
- User rights under GDPR / CCPA / equivalent
- How to delete an account

**⚠ Not legal advice.** Hire a lawyer for jurisdiction-specific drafting (HK + US + EU are the three frameworks most likely to apply). Templates from Iubenda or Termly are a fine starting point but should be reviewed.

### 8.6 Audit logging

Log to a separate `audit_log` table:
- Subscription state changes (with the triggering webhook event ID)
- Account deletions
- Password changes
- Failed login attempts (rate-limit signal)

Retain audit logs for **at least 1 year** for compliance traceability.

---

## 9. Security: Payment Details

### 9.1 We don't store payment details

Stripe Checkout means **Stereoscope never sees a card number, CVV, or expiry**. Card data goes browser → Stripe directly. Our server only ever sees Stripe's customer ID and subscription ID.

This is the most important security decision in the entire document. Don't ever build a card form yourself.

### 9.2 PCI compliance scope

By using Stripe Checkout only:
- **PCI SAQ-A** applies — the simplest scope. Annual self-assessment, no quarterly scans, no penetration testing required.

If we ever build our own card form (Stripe Elements):
- Scope jumps to **SAQ-A-EP** — requires quarterly scans, more documentation.

**Stay in SAQ-A** until volume justifies more.

### 9.3 Webhook security

The Stripe webhook endpoint must:
1. Verify the `Stripe-Signature` header using `stripe.webhooks.constructEvent` with the webhook secret from env. **Without this, anyone can POST fake "you've been upgraded" events.**
2. Be idempotent — same event ID processed twice has no effect.
3. Return 200 only after the database update succeeds. Stripe retries failures.
4. Log the event ID and outcome to `audit_log` for every invocation.

### 9.4 Webhook secret rotation

Rotate the webhook secret quarterly. Stripe lets you have multiple active secrets during rotation. Document the rotation procedure.

### 9.5 Refund policy

Recommend: **prorated refund within 7 days of charge, no refund after**. Stated in ToS. Implement via Stripe API when needed; don't build a self-serve refund flow.

---

## 10. Security: Hacking Prevention

### 10.1 Threat model

The realistic threats to Stereoscope:

| Threat | Likelihood | Mitigation |
|---|---|---|
| Credential stuffing on email/password | High | Supabase rate limit + bcrypt; consider Cloudflare Turnstile on login |
| Gemini-cost abuse (someone runs unlimited analyses) | High | Hard cap 60/mo + auth-required + cap pre-check |
| Webhook spoofing (fake "you've upgraded") | High | Stripe signature verification (mandatory) |
| SQL injection | Low | Supabase parameterised queries; never construct raw SQL |
| XSS in user-generated journal content | Medium | React auto-escapes; never use `dangerouslySetInnerHTML` for user text |
| CSRF | Low | Next.js + Supabase cookies handle same-origin; ensure SameSite=Lax |
| Session hijack | Medium | Short-lived JWTs (1h), refresh-token rotation, HttpOnly cookies |
| DDoS | Low | Vercel handles edge mitigation; consider Cloudflare in front if it becomes an issue |
| Prompt injection via ticker name | Medium | Ticker validated to `[A-Z]{1,6}` — no untrusted user input reaches Gemini |
| Reading another user's journal | Medium | RLS policies; tested with explicit cross-user test cases |
| Data exfiltration via SQL function exploits | Low | Don't write custom Postgres functions unless audited |

### 10.2 Rate limiting

Per-IP and per-user limits on these endpoints:

| Endpoint | Per-IP / hour | Per-user / hour |
|---|---|---|
| `/api/analyze` | 20 | 10 |
| `/api/journal` | 60 | 30 |
| `/auth/login` | 10 | 5 |
| `/api/stripe-webhook` | unlimited (Stripe verified) | — |

Implement with Upstash Redis or Vercel's built-in middleware. ~$10/mo for Upstash at expected scale.

### 10.3 Input validation

Every endpoint validates input against a Zod schema before any processing. Reject early; log rejection patterns to detect probing.

### 10.4 Secrets management

- All secrets in environment variables, never in source.
- Different secret values per environment (dev, staging, production).
- `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` are the four secrets that must never leak.
- Rotate any leaked secret immediately (Supabase, Stripe, Gemini all support rotation).
- Add a pre-commit hook scanning for secrets (e.g. `gitleaks`).

### 10.5 Dependency security

- Run `npm audit` weekly; fix highs and criticals before they age past 7 days.
- Pin major versions in `package.json`; use `npm ci` in production builds.
- Subscribe to GitHub Dependabot alerts.

### 10.6 Logging and monitoring

- Sentry for error tracking
- Vercel logs for request-level traces
- Supabase audit logs for database operations
- Alert on: 5xx rate >1%, auth-failure spikes, sudden Gemini cost spikes

### 10.7 Incident response

A short runbook (1 page) covering:
- How to revoke a compromised secret
- How to disable a user account
- How to roll back a deployment
- Who to notify if customer data is impacted (likely GDPR 72-hour notification window)

---

## 11. Copyright, IP, and Brand

### 11.1 Stereoscope's own IP

| Asset | Treatment |
|---|---|
| Source code | Decide license: closed-source (default) or open-source under a permissive licence (MIT, Apache 2.0). Recommendation: **closed-source** until business model is proven |
| Prompts (`growth-scout.ts`, `value-guard.ts`, `arbiter.ts`) | These are the actual moat. **Closed-source, server-side only.** Never expose via API. Treat as trade secrets |
| UI / brand / methodology page copy | Copyright protected automatically; mark with © Stereoscope 2026 in footer |
| Stereoscope wordmark and logo | Consider trademark registration in primary markets (USPTO ~$250, HK ~HK$2k, EU ~€850). Recommendation: **register the wordmark** in the jurisdiction you plan to launch first |
| Domain name | Register variants defensively (stereoscope.com, .ai, .co, primary-market TLDs) |

### 11.2 Third-party IP we touch

| Source | Status | Action |
|---|---|---|
| Guru names (Buffett, Lynch, Munger, etc.) | Real people, public figures | Educational reference is fair use; never imply endorsement |
| Investment frameworks (CANSLIM, Magic Formula, Dhandho) | Public domain methodology | Cite source where appropriate |
| Filing data from SEC EDGAR | Public domain | No restriction; attribute as "SEC EDGAR" |
| HKEXnews / ASX (if expanded) | Generally public | Check terms; usually attribution-only |
| Wikipedia content (if used for any descriptions) | CC BY-SA | Attribute and share-alike if derivative |
| Yahoo Finance autocomplete | **Grey area** — we use the unofficial endpoint | Consider a licensed source (Finnhub, IEX) before launch to remove this risk |
| Gemini outputs | Owned by us under Google's API terms | Stays as-is |
| Guru portrait SVGs | Need to confirm provenance | Audit `public/gurus/*.svg`; if scraped from Wikipedia, attribute properly |

### 11.3 User-generated content (journals)

In the ToS, declare:
- The user **owns** their journal content
- They grant Stereoscope a **limited licence** to store and display it back to them
- Stereoscope will **not** use journal content for model training without explicit opt-in
- Journals are not shared with other users; not used in the screener; not part of the cache

### 11.4 Generated reports

The reports themselves are derivative works of:
- Public filings (no copyright issue)
- The Gemini model output (we own under Google's API terms)
- Our prompts (our IP)

**Cached reports are shared across users via the screener** — this is a deliberate product decision. The ToS should make clear that running an analysis contributes the result to a community cache, not that the user "owns" the report exclusively.

### 11.5 Trademark watch

If the name takes off, expect knock-offs. Set up a Google Alert on "Stereoscope" + finance/investing terms. Address infringement via DMCA / cease-and-desist where applicable.

### 11.6 Disclaimers

Already partially in place (no buy/hold/sell). Strengthen for the paid tier:
- Not personalised financial advice
- Not registered as an investment advisor anywhere
- Past performance / cached analysis does not guarantee future results
- Users are responsible for their own decisions

**Have a lawyer review the disclaimer copy** before charging. The line between "educational tool" and "financial advice" is jurisdiction-specific and the wrong wording can trigger licensing requirements.

---

## 12. Build Order

### Phase 1 — Auth foundation (1–2 days)
- Supabase Auth providers configured (email + Google)
- Sign-up and login routes
- Email verification flow
- Session middleware in `middleware.ts`
- Account page at `/account`
- Protected route detection

**Checkpoint:** Manual test — sign up, verify email, log in, log out, hit a protected route.

### Phase 2 — Usage table and metering (1–2 days)
- `analysis_usage` table + RLS policies
- `profiles` table + RLS policies
- Cap-check in `/api/analyze`
- Credit-meter UI in Masthead
- Cap-reached modal
- "No credit charged" toast on failures

**Checkpoint:** Manual test — free user runs 3 analyses, hits cap, sees modal. Failed analysis doesn't decrement.

### Phase 3 — Stripe integration (2–3 days)
- Stripe products and prices configured
- `/api/stripe-checkout` to create sessions
- `/api/stripe-webhook` with signature verification
- Customer portal link
- Tier-change effects on the cap
- Upgrade CTAs in the cap-reached modal and meter

**Checkpoint:** End-to-end — sign up → run 3 analyses → hit cap → upgrade via Stripe test card → see Pro features unlock immediately.

### Phase 4 — Hardening (1 day)
- Rate limiting (Upstash Redis)
- Sentry integration
- Privacy Policy and ToS pages
- Audit log table and write paths
- Account-deletion endpoint
- Data-export endpoint

**Checkpoint:** Security review against threat-model table. Run a basic pen-test (OWASP ZAP) against staging.

### Phase 5 — Launch (0.5 days)
- DNS, custom domain
- Production env vars
- Stripe live keys
- Database backup verification
- Monitoring alerts armed

---

## 13. Open Questions for Decision

These are decisions only you can make. Please respond inline before we start building.

1. **Currency and billing region.** Are we charging in USD only, or also accepting local currencies? Stripe handles both but adds ~1.5% on conversion.

2. **Business entity.** Where will the business be incorporated? Affects tax obligations, GDPR applicability, and which lawyer reviews the ToS.

3. **VAT/GST/Sales tax.** Should Stripe Tax be enabled? Cost: 0.5% per transaction. Recommended if selling to EU/UK consumers.

4. **Annual plans.** Ship at launch (save $18 / year on Researcher, save $38 on Pro) or defer? Recommendation: ship at launch, easier to set up than to add later.

5. **Refund policy.** Default proposal: prorated refund within 7 days, no refund after. Acceptable?

6. **Free tier monthly analyses.** 3, 5, or 7? More generous = better discovery but higher Gemini bill from free riders. Recommendation: 3 with 5 grace credits in month one.

7. **Support channel.** Email-only, or build an in-product help widget? Recommend: email-only (founder-replies) for first 6 months.

8. **Analytics.** Are we tracking user behaviour beyond auth/usage? If yes, GDPR consent banner needed. Recommend: defer until product-market fit.

9. **License for the code.** Closed-source by default; revisit if we ever want community contributions.

10. **Country-specific blocks.** Are there countries we should not accept signups from (sanctions, OFAC)? Stripe handles its end but we should match.

11. **Children's protection (COPPA, etc.).** Add an age gate at signup (13+)?

12. **Yahoo Finance dependency.** Should we replace the unofficial Yahoo endpoint with a licensed source (Finnhub free tier, IEX, Twelve Data) before launching paid tiers? Recommendation: yes, before launch.

---

## 14. Out of Scope

These were discussed in earlier conversations and explicitly deferred:

- HKEX, ASX, LSE, or any non-US exchange support
- Real-time price overlay (live data layer)
- Scenario mode
- Comparison mode (deferred to roadmap)
- Email alerts on trigger fires (deferred to roadmap)
- Mobile native apps
- Team / family plans

---

## 15. Risks and Unknowns

- **Gemini pricing changes.** A 2× increase in Gemini cost compresses margins meaningfully on Pro power users. Mitigation: prompt compaction work (already done) buys headroom; can also switch to smaller models per-lens if cost spikes.
- **Stripe geographic constraints.** Stripe is unavailable in some jurisdictions. Confirm operational country supports Stripe before committing.
- **Supabase pricing scale.** Free tier dies at modest scale; Supabase Pro is $25/mo but compute add-ons scale fast at >1k concurrent users.
- **Adoption uncertainty.** Three tiers with a $9 mid-point is well-researched but unproven for this specific product. Plan to revisit pricing after 100 paying users.
- **Regulatory drift.** "AI-powered financial tool" is a category regulators are starting to look at. Monitor SFC (HK), SEC (US), FCA (UK), MAS (SG) guidance.
- **Single-vendor LLM dependency.** All three engines run on Gemini. If Google deprecates 2.5 Flash or changes terms, the whole product is exposed. Mitigation: keep prompts model-agnostic enough to port to Claude or GPT in a week.
