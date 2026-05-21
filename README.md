<div align="center">

**BCFFL League Page**

Custom Sleeper league site for the Bonecrusher Fantasy Football League.

</div>

> Forked from [ff-league-page](https://github.com/jake-kelley/ff-league-page) -- Forked from the [(Unofficial) Sleeper League Page Template](https://github.com/nmelhado/league-page) Original credit to Nicholas Melhado for the base and Jake Kelley for his fork.

---

## Features

A full-featured dynasty league site that pulls live data from Sleeper and adds tooling around it.

**League info**
- Live rosters with FantasyCalc total-value badges and expandable benches
- **Value Rankings** — positional stacked-bar leaderboard with league-average marker, per-team % vs avg, and an *Include rookie picks* toggle that recomputes totals and re-sorts on the fly
- **Historical Matchups** — year dropdown spanning every prior season; each renders as a dense per-week × per-manager grid with W/L colors, opponent avatars, and PF / PA / Avg / High summary columns
- Manager pages with all-time trade history, favorite-team logos, contact icons, and rebuild-mode badges
- **Constitution** and **Dynasty 101** primer — markdown-driven with sticky TOC, active-section tracking, and color-coded callouts

**Trade tooling**
- **Trade Calculator** with FantasyCalc values, positional analysis, and a suggestion engine that proposes single-piece adders (and 2-piece combos) to bring lopsided trades within 5% of fair
- Click any trade card to open the trade in the calculator pre-loaded. Picks resolve to their actual draft slot (e.g. `2026 Pick 1.07`) via `slot_to_roster_id` / `draft_order`
- Trade cards display the specific pick slot inline (`Pick 1.07`)
- Player & pick values page with sortable filters and Sleeper player thumbnails

**Knowledge layer**
- **Dynasty KB** — 50+ markdown articles, full-text search across title + body, sticky category sidebar with active-article highlighting and per-article match counts
- **Manager Activity** panel on the Trades & Waivers tab — all-time trade/waiver counts per team, sorted by total activity
- **Helpful Resources & News** — curated link list with the latest Sleeper trending news beneath

**Editing**
- Constitution, Dynasty 101, KB articles, and the Resources link list are editable live without a redeploy
- Floating edit button → password prompt → 8-hour session → in-place markdown textarea pre-filled with the current content
- Resources gets a dedicated GUI: add / remove / reorder rows

**Polish**
- Player thumbnails (Sleeper CDN) on roster rows, trade cards, value tables, and trade-calc autocompletes
- Mobile-tuned layout at ≤768px (compact roster rows, condensed Value Rankings)
- Light reading panels for content pages so long-form text stays readable in either system theme

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 runes mode
- [Sleeper API](https://docs.sleeper.app/) — rosters, transactions, drafts, matchups, brackets
- [FantasyCalc API](https://api.fantasycalc.com/) — dynasty player + pick values, cached for 12h via a Vercel cron-warmed CDN cache
- [`marked`](https://marked.js.org/) — markdown rendering for KB, Constitution, Dynasty 101
- [`@upstash/redis`](https://upstash.com/) — KV store for editor overrides + sessions
- [SMUI](https://sveltematerialui.com/) — Material components (data tables, buttons, etc.)

## Setup

### League data

`src/lib/utils/leagueInfo.js`:

- `leagueID` — your Sleeper league ID
- `leagueName`, `dues`, `dynasty` — league metadata
- `homepageText` — league intro paragraph
- `managers` — one entry per manager with `name`, `managerID` (Sleeper user_id), `bio`, `photo`, and optional `favoriteTeam` (lowercase NFL abbr), `mode` (`"Win Now"` / `"Rebuild"`), and `preferredContact` (`"Sleeper"`, `"Discord"`, `"Email"`, etc.)

### Environment variables

| Var | Purpose |
| --- | --- |
| `EDIT_PASSWORD` | Shared password for the editor (Constitution / Dynasty 101 / KB / Resources) |
| `UPSTASH_REDIS_REST_URL` | KV endpoint — auto-injected when Upstash Redis is installed from the Vercel Marketplace |
| `UPSTASH_REDIS_REST_TOKEN` | KV token — auto-injected |
| `VITE_CONTENTFUL_SPACE` | Optional, for the blog: Contentful space ID |
| `VITE_CONTENTFUL_ACCESS_TOKEN` | Optional, for the blog: Contentful management token |
| `VITE_CONTENTFUL_CLIENT_ACCESS_TOKEN` | Optional, for the blog: Contentful delivery token |

