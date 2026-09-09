# Market Filter — Advertising & Monetization Research

**Date:** 2026-09-06 | **Status:** Research complete

## The Reality Check

A brand-new site with near-zero traffic **cannot** get into the premium ad networks immediately. They all require a minimum traffic threshold. The path is: **start with Google AdSense → grow traffic → upgrade to a premium network** once you hit their thresholds.

## Ad Network Options (in order of entry)

### 1. Google AdSense — START HERE
- **The entry point.** No minimum traffic requirement to apply, but Google reviews the site for quality/content policy.
- **Requirements:** Original content, clear navigation, privacy policy, no prohibited content (financial content is fine — it's not "YMYL" blocked, just needs to be accurate and not misleading).
- **Payout:** ~$1-5 RPM (revenue per 1000 pageviews) for financial niche — actually higher than average because finance is a high-CPM vertical.
- **Pros:** Easy to start, no traffic threshold, works on Vercel/Next.js.
- **Cons:** Lower RPM than premium networks, Google takes ~32% cut.
- **Timeline:** Can apply immediately once the site is live with real content.

### 2. Ezoic — EARLY GROWTH
- **Requirements:** ~10,000 monthly pageviews (some sources say lower now, ~5-10k).
- **Pros:** AI-optimized ad placement, higher RPM than AdSense, Google Premier Partner.
- **Cons:** Requires traffic first, ad layout can be intrusive if not tuned.
- **Timeline:** Reachable within a few months of consistent publishing.

### 3. Mediavine — MID-TIER
- **Requirements:** ~50,000 monthly sessions (confirmed: they emphasize "5% human-verified traffic" — real humans, not bots).
- **Pros:** Premium demand, high RPM, great for content sites, 20,000+ publishers.
- **Cons:** 50k sessions is a real milestone — needs months of growth.
- **Timeline:** 6-12 months of consistent publishing.

### 4. AdThrive / Raptive — PREMIUM
- **Requirements:** ~100,000 monthly pageviews (premium tier).
- **Pros:** Highest RPMs, $4B paid to creators, 224M consumers monthly, top-tier support.
- **Cons:** Highest bar, most selective.
- **Timeline:** 12+ months, only after significant traffic.

## Financial Niche Advantage

**Finance is a high-CPM vertical.** Advertisers (brokers, banks, fintech, trading platforms) pay premium rates for finance audiences. This means:
- Even AdSense RPMs in finance run **2-3x higher** than general content.
- The affiliate angle (broker signups: IBKR, Trading212, eToro) can out-earn display ads entirely.

## Recommended Path for Market Filter

```
Phase 1 (launch):  Google AdSense — apply immediately, low bar
Phase 2 (3-6 mo):  Ezoic — once ~10k monthly pageviews
Phase 3 (6-12 mo): Mediavine — once ~50k monthly sessions
Phase 4 (12+ mo):  Raptive/AdThrive — once ~100k pageviews
```

## Implementation Notes (for the build)

- **AdSense on Next.js:** Add the AdSense script to `_document.tsx` (or app layout), place `<ins class="adsbygoogle">` ad units in the story list and sidebar.
- **Ad placement in Design 01 (The Terminal):** Natural spots are:
  - Below the hero / above "Today's Signals"
  - Between story cards (in-feed ad)
  - A sidebar/leaderboard unit
- **Privacy policy required** for AdSense approval — need to add one (GDPR/CCPA compliant).
- **Consent management** (cookie banner) needed for EU/UK traffic — Google's CMP or a lightweight option.

## Key Caveats

1. **Don't buy traffic** — Mediavine explicitly requires "human-verified traffic." Bought/bot traffic gets you rejected.
2. **Original content matters** — AdSense and premium networks reject thin/duplicated content. Our "AI angles on filings" approach is defensible as original, but each story must be substantive, not just a headline rewrite.
3. **Financial content compliance** — keep the "not investment advice" disclaimer, avoid anything that reads as a recommendation. This protects both ad approval and legal exposure.

## Sources
- Mediavine: mediavine.com (20,000+ publishers, 114M monthly visitors, "5% human-verified traffic")
- Ezoic: ezoic.com (5K+ premium sites, 768M monthly pageviews, Google Premier Partner)
- AdThrive/Raptive: adthrive.com / raptive.com ($4B paid to creators, 224M consumers monthly)
- Google AdSense: support.google.com/adsense
