# LANDING INTEGRATION PLAN — story → portfolio landing

## 1. Confirmed landing page

- **Project root:** `C:\Users\maram\Pictures\portfolio\portfolio`
- **Framework:** TanStack Start (React 19 + Vite 8 + Tailwind 4 + Framer Motion)
- **Landing route:** `src/routes/index.tsx` (route `/`, full-screen hero, `h-screen w-screen`)
  - Background: `src/assets/cosmic-hero.jpg` (`index.tsx:5,75-83`), gradient overlay (`:86`), `StarField count={50}` (`:89-96`)
  - Badge "✦ MARAM'S PORTFOLIO" (`:102-110`)
  - Headline "Crafting intelligent *systems*, one *Project* at a time." with 30s rotating word (`:113-152`)
  - Sub copy 2 lines (`:154-163`)
- **Entry trigger:** `motion.button` "ENTER UNIVERSE →" — `index.tsx:166-179`, `onClick={() => navigate({ to: "/universe" })}`
- **Next page:** route `/universe` — `src/routes/universe.tsx`. Client-side TanStack route navigation (no hash). Background there: fixed `StarField` + `bg-spotlight` CSS layer (`universe.tsx:45-50`, `.bg-spotlight` defined in `src/styles.css:135`) over `bg-background`.

## 2. Current entry behaviour

Click button → `navigate({ to: "/universe" })`. Default instant route swap; no shared transition.

## 3. Custom cursor — RESOLVED (user confirmed)

"The custom cursor" = **the star that follows the mouse when it moves**, i.e. the starfall trail inside the portfolio's `StarField` component — `src/components/portfolio/StarField.tsx`:

- **Trigger:** window-level `mousemove` — `StarField.tsx:357-401` (`handleMouseMove`): every move spawns a tiny glowing star sprite (32–40px rolling pool, `TRAIL_MAX_STARS=40`, `TRAIL_FACE_SPEED 0.003` fade, subtle float) at the exact cursor point projected into the three.js scene; stars fade and drift on their own rAF loop (`:598-621`).
- **Related pointer effects in the same component (all preserved, untouched):** camera/starfield parallax toward the cursor (`:470-491`, lerp 0.05/0.03), stars repelled within 180px of the pointer (`REPEL_RADIUS`, `:540-553`), click → 30-star burst that settles into permanent twinkle (`:408-451, 623-701`).
- `StarField` is rendered on **both** routes: `/` (`index.tsx:89-96`, count=50) and `/universe` (`universe.tsx` fixed layer). The trail is a dom effect of the component — it fires on window mousemove, so it works on the landing today and keeps working on /universe after entry. No CSS blend-mode cursor, no DOM readout element exists.

⚠️ Do not touch `StarField.tsx` in any stage. The mismatch with the story's own `#cursor` ring cursor is moot: the story's cursor is NOT being ported.

The earlier story-project cursor section is retained below for reference only.

## 4. Story structure (`C:\Users\maram\Desktop\story\long-way-home`)

Static site: `index.html` (8.7 KB), `main.js` (37.7 KB, three.js + GSAP/ScrollTrigger + Lenis), `style.css` (16.9 KB), vendored `fonts/` (Fraunces + Inter woff2), `vendor/` (three, gsap, lenis), zero-dep `server.mjs` (port 5173). `package.json` → `node server.mjs`.

Six movements (beats), each `<section class="beat">` in `index.html:88-158`:

| Beat | Label | Headline | As intro? |
|---|---|---|---|
| 0 | **i — the last evening** | "You said you'd wait up." | excluded |
| 1 | **ii — leaving the blue** (`index.html:99-106`) | "Everything gets quiet up here." / "The noise you make to fill a room doesn't reach this high." | ✔ slice start |
| 2 | **iii — past whole worlds** (`:108-117`) | "I passed whole worlds without stopping." / "None of them were where you were." + drift line "Notice how long the nothing lasts…" | ✔ |
| 3 | **iv — all of it, at once** (`:119-126`) | "And then — all of it, at once." / "Every colour I ever wanted to show you. I kept thinking: you would have loved this." | ✔ slice end |
| 4 | v — the one light | "So I left one light on too." | excluded |
| 5 | finale | "Goodnight. I made it somewhere beautiful." | excluded |

**Slice boundaries confirmed (verbatim):**
- START `ii`: `<p class="eyebrow">ii — leaving the blue</p>` … `<p class="sub">The noise you make to fill a room doesn't reach this high.</p>`
- END `iv`: `<p class="eyebrow">iv — all of it, at once</p>` … `<p class="sub sub--italic">Every colour I ever wanted to show you. I kept thinking: you would have loved this.</p>`

**Story motion primitives (to reuse):** split-text word cascade (`splitText()`, `main.js:558-587`; reveal via `gsap.fromTo` word inners yPercent 110→0, expo.out, stagger 0.05 — `main.js:676-693`), masked-word spans `.word > .word__inner`, `data-reveal="up|fade"` fades, scroll-driven state.

## 5. Personal/about files & media

- **No personal/bio/about files exist inside `Desktop\story`** — only code, fonts, vendor libs. UNDETERMINED: user said "about me" files inspire part-ii welcome text; none found. Candidate sources that DO exist in the portfolio repo: `src/data/portfolio.ts` (`profile.intro` `:80-81`, `profile.about` `:82-83` — **VERIFIED**, public on the site today → safe to use).
- **Media assets:** none (no images/audio/video). Fonts + three/gsap/lenis are vendored third-party binaries — flagged; not needed in portfolio (deps already there).

## 6. Landing ↔ story slot mapping

| Landing slot | Story part |
|---|---|
| Badge "MARAM'S PORTFOLIO" | keep as-is |
| Headline "Crafting intelligent systems, one *Project* at a time." | keep as part-ii opening welcome (welcome text woven in per Stage 1, drawn from `profile.about`/`profile.intro`) |
| Rotating word / sub copy | replaced by ii → iii → iv sequence (timed in Stage 2) |
| "ENTER UNIVERSE →" button | retired as primary trigger; replaced by **end-of-iv auto-entry** (Stage 3) + accessible skip fallback |

## 7. Trigger change (recommendation only — not applied)

- Remove `onClick` navigate on the button as primary entry. When the iv reveal completes (last word settled + short hold, ~0.8–1.2s), fire `navigate({ to: "/universe" })` once.
- **Keyboard-accessible fallback (recommended):** a visible, focusable `<button>` styled as a quiet mono pill in the bottom-centre (echoing the story's scrollcue position): label `SKIP INTRO →` / then `ENTER UNIVERSE` after iv completes; `Tab` reachable, `Enter`/`Space` activates, same `navigate`. `prefers-reduced-motion` → show all three parts statically + fallback visible immediately.
- Next-page background visibility on entry: `/universe` already renders its fixed StarField + `bg-spotlight` on mount; ensure entry transition keeps landing fading out (AnimatePresence-style opacity) so universe bg reads as "becoming visible" — reproduced with existing motion primitives.

## 8. Risks and unknowns

- REMOVING the entry button changes expectations for direct visitors — mitigated by fallback button. **VERIFIED**
- Rotating-word state/logic will be removed when sub-copy slots are replaced. **VERIFIED**
- Story sequence timing must not use GSAP timeline if the landing keeps Framer Motion only → plan: Framer `motion` staggering (landing's existing primitive); report deviation if word-mask cascade can't match story exactly. **UNDETERMINED until Stage 2**
- **Risks and unknowns:** Cursor: RESOLVED — the cursor is StarField's mouse-follow starfall trail (`StarField.tsx`), present on both routes, no changes needed. **VERIFIED**
- WebGL: story's three.js scene will NOT be ported; landing keeps cosmic-hero + StarField. **VERIFIED by scope (text slice + trigger only)**
- `?dev=1` controls (Stage 2) must not ship in production path. — n/a yet
- No framework perf flags concerns documented yet.

## 9. Environment notes

- Portfolio dev server: `npm run dev` (`portfolio/`), port **8080** — currently running (background task `sh_1a8d0e767001x31n01nOF70GfY`).
- Story runs standalone via `node server.mjs` on 5173 (not needed unless visual reference).
- Screenshots will go to `research/shots/stage-<N>/`.
