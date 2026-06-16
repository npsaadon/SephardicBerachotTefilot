# Sephardic Berachot & Tefilot — Design Spec

**Date:** 2026-06-15
**Status:** Approved (design phase)
**Goal:** A clean, fast, offline-first Sephardic berachot & tefilot app, shippable to the Apple App Store and Google Play from a single codebase.

---

## 1. Product summary

A practical Sephardic reference app answering one core question fast: **"What beracha do I say?"** A user opens the app, types a food (e.g. "pizza," "rice," "coffee"), and instantly sees the correct Sephardic beracha rishona, the beracha acharona, Hebrew text, transliteration, English, and halachic notes — fully offline. The app also provides commonly needed tefilot (Tefilat HaDerech, Asher Yatzar, Birkat HaMazon, etc.).

It is **not** a full siddur. It is a focused daily-use Sephardic guide. The flow is: **Open → Search → See beracha → Done.**

### Key decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Content source | Seeded from authoritative Sephardic (Edot HaMizrach) sources via web research; every entry flagged `reviewed = false` ("pending rabbinic review") until a rabbi verifies. |
| Store accounts | Build a fully deployable app now; developer accounts & submission handled later. Deliver a submission playbook. |
| Tech stack | Expo (React Native + TypeScript) app · Supabase (Postgres) backend · Next.js admin panel. |
| User accounts | **No login** in MVP. Favorites & recent searches stored device-local. Optional accounts/sync deferred to v2. |
| Minhag | One standard (Edot HaMizrach), clearly labeled. Multiple minhagim deferred to v2. |
| Home layout | Tile grid (search bar + 2×2 quick-action tiles + recent chips). |
| Result card | Colored before/after cards (gold-bordered "before," blue-bordered "after"), H/translit/English toggle, complexity banner. |
| Palette | White background; navy `#1a2b4a`, gold `#c9a227`, blue `#2e5c8a` accents; large readable Hebrew. |

---

## 2. Architecture

Monorepo with three deployable parts plus shared content:

```
SephardicBerachotTefilot/
├── app/          # Expo (React Native + TypeScript) — the mobile app
├── admin/        # Next.js web admin panel (content CRUD)
├── supabase/     # DB schema, migrations, seed data, RLS policies
└── content/      # Source-of-truth seed dataset (JSON) + generation/validation scripts
```

- **Mobile app (Expo/RN):** offline-first. Ships with a bundled SQLite snapshot of all content, so it works instantly on first launch with zero network. On launch (when online) it compares `content_version` against Supabase and syncs deltas in the background.
- **Backend (Supabase/Postgres):** canonical content store. Powers the admin panel; serves content updates to the app. Row-Level Security: public read, admin-only write.
- **Admin panel (Next.js):** password-protected via Supabase Auth (admin role only). CRUD for foods + tefilot; "Publish" bumps `content_version`.
- **Update paths:** content/data changes reach users via Supabase sync (no app-store release). App code/UI changes via Expo EAS Update (OTA) or a normal store release.

---

## 3. Data model

Defined in Supabase (Postgres); mirrored into the bundled SQLite snapshot consumed by the app.

### `berachot`
Reference list of blessings.
`id, key, name_en, name_translit, hebrew, type` — `type` ∈ {`rishona`, `acharona`}.
Examples: Borei Pri HaEtz, Borei Pri HaAdama, Borei Minei Mezonot, Shehakol, Hamotzi, Borei Pri HaGafen, Borei Nefashot, Al HaMichya, Al HaGefen, Al HaEtz, Birkat HaMazon.

### `foods`
`id, name, slug, category_id, beracha_before_id (FK berachot), beracha_after_id (FK berachot, nullable), complexity, notes_md, amount_acharona, time_acharona, source, reviewed (bool), minhag (default 'edot_hamizrach'), active (bool), updated_at`
- `complexity` ∈ {`simple`, `note`, `complex`, `ask_rav`}. Drives whether the "ask a rabbi" banner shows.

### `food_aliases`
`id, food_id (FK), alias` — e.g. "fries" / "french fries" / "potato fries" → one food.

### `categories`
`id, name, slug, sort_order, icon` — Bread/Hamotzi, Mezonot, Wine & grape juice, Fruits, Vegetables, Drinks, Meat/fish/eggs, Dairy, Snacks, Desserts, Cooked foods, Mixed foods, Questionable foods, Sephardic-specific cases.

### `tefilot`
`id, title, slug, category, hebrew, translit, english, notes_md, when_to_say, nusach, source, reviewed (bool), audio_url (nullable, unused in MVP), sort_order, active, updated_at`

### `content_version`
Single-row table holding an integer/timestamp bumped on every admin publish. The app compares this value to decide whether to sync.

### Search
Runs **locally** on the device: SQLite FTS5 over food names + aliases, with a fuzzy fallback for typos. Instant and fully offline. **Favorites** and **recent searches** are stored device-local (e.g. SQLite/AsyncStorage) — no accounts.

---

## 4. Mobile app — screens & navigation

Stack navigation rooted at the tile-grid home.

- **Home** — search bar ("What beracha do I say?") + 2×2 tiles (Tefilat HaDerech · Beracha Acharona · Common Tefilot · Categories) + recent-search chips + Favorites shortcut.
- **Search results** — live results as the user types (name + alias + fuzzy).
- **Food detail** — colored before/after cards; Hebrew / +transliteration / +English toggle; complexity banner for `complex`/`ask_rav`; notes; amount + time window for the acharona; favorite toggle; "pending rabbinic review" flag where `reviewed = false`.
- **Categories** — category list → foods within a category.
- **Beracha Acharona guide** — explanatory sections: Borei Nefashot, Al HaMichya, Al HaGefen, Al HaEtz, Birkat HaMazon, when none is said, minimum amounts, time limits, common mistakes.
- **Tefilot list** → **Tefila reader** — same H/translit/English toggle; large RTL Hebrew; audio button hidden in MVP.
- **Tefilat HaDerech** — reachable directly from home tile; Hebrew, translit, English, when/when-not to say, practical notes.
- **Favorites** — saved foods + tefilot.
- **Settings / About** — default display mode; disclaimer; "Halachic content reviewed by …" placeholder.

### MVP tefilot set
Asher Yatzar, Tefilat HaDerech, Shema Al HaMita, Birkat HaMazon, Borei Nefashot, Al HaMichya, Al HaGefen, Al HaEtz, Modeh Ani, Kriat Shema, Ana Bekoach, plus a small set of Tehillim favorites.

---

## 5. Content strategy

Generate a seed dataset of **~250–400 common foods** spanning all categories (emphasizing mixed-foods cases: pizza, sushi, cereal with milk, schnitzel, ice cream cone, granola bar, sandwiches, salad with croutons, etc.) plus the MVP tefilot texts, researched from authoritative Sephardic (Edot HaMizrach) sources. Every entry ships with `reviewed = false` and complexity-appropriate disclaimers until a rabbi verifies. Stored as versioned JSON in `content/`, loaded into Supabase and bundled into the app build.

The app clearly distinguishes: simple cases · common cases with a note · complex cases that depend on details · cases where the user should ask a rabbi.

---

## 6. Deployment (built-in from day one)

- **Expo + EAS** configured from the start: `eas build` (iOS + Android), `eas submit` (both stores), `eas update` (OTA).
- App config ready for store listings: name "Sephardic Berachot," bundle/package IDs, app icon, splash screen, privacy entries (no tracking, no accounts → simple privacy story).
- **Admin** deploys to Vercel.
- **Supabase** project provisioned with migrations + RLS (public read, admin-only write).
- Deliverable: a **step-by-step store submission playbook** — store listing copy, screenshots, privacy questionnaire answers, and the exact build/submit commands — so the app can be published whenever developer accounts are ready.

---

## 7. Testing

- Unit tests for search/alias/fuzzy logic and for sync/version logic (highest-risk areas).
- Content-validation test: every food has a valid before-beracha, a valid category, and non-empty Hebrew; aliases unique.
- Manual smoke checklist covering all screens before each release.

---

## 8. Build order

Each step is a shippable increment:

1. Data model + Supabase migrations + seed/validation pipeline.
2. Offline search (FTS5 + fuzzy) + food detail screen.
3. Categories + tefilot list/reader + Tefilat HaDerech + Beracha Acharona guide.
4. Favorites / recent searches / settings (device-local).
5. Admin panel (Next.js, Supabase Auth, CRUD + publish).
6. Sync (content_version delta) + EAS build/submit/update config + store submission playbook.

---

## 9. Out of scope (deferred to v2+)

Audio; multiple minhagim with user selection; reminders (Tefilat HaDerech, Sefirat HaOmer, Yaaleh VeYavo, Al HaNissim); zemanim; kids/quiz/flashcard mode; Shabbat/Yom Tov section; rabbi Q&A; community features (suggest/report/vote); full siddur; cross-device account sync; monetization.
