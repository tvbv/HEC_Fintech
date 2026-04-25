## Goal

Tighten the three level flows (Banking, Taxes, Benefits) into a cute, premium, visually-led mobile experience. Strip generic emojis, replace bank letter-circles with real logos, simplify each screen so visuals do more of the work, fix lingering color/contrast issues from the old coral/porcelain palette, and route every level's success state back to the quest map.

## 1. Color & contrast cleanup (cross-cutting)

Audit and replace remaining legacy classes that look "off" against the black/navy/lemon system:

- `level.banking.tsx` — many residues: `bg-white`, `text-ink/60`, `text-coral`, `border-coral`, `bg-white/30`, `bg-white/40`, `bg-coral/30`, hardcoded `linear-gradient(... #EF8354 ... #4F5D75 ...)` in ApplyStep + SuccessStep, `border-ink-black/10/60`.
- Replace with system tokens: `card-navy`, `text-white`, `text-white-60`, `text-lemon`, `border-lemon`, `bg-gradient-hero-card`, `bg-gradient-lemon`, `card-hero`.
- Compare modal: switch from white sheet to `bg-black` with `card-navy` rows, lemon highlight on the chosen bank.
- Bottom sticky compare bar: replace white background with `glass-dark` (translucent black + lemon border).

## 2. Bank logos (replace letter circles)

Add a small `BankLogo` component in `src/components/concierge/BankLogo.tsx` that returns a hand-tuned inline SVG per bank — no remote dependencies, no broken images.

- `Revolut` — black rounded square with white "R" mark approximation (signature angular R).
- `N26` — minimal lowercase "n26" wordmark on lemon background.
- `Société Générale` — red/black squared-half block (their iconic logo style).
- Fallback: monogram chip, but only used if a bank we don't know is added later.

Use the component everywhere the letter circle was used:
- `BankCard` header
- `CompareModal` selector tiles
- Sticky compare bar avatar stack

## 3. Banking level (`src/routes/level.banking.tsx`) — less text, more visuals

### Intro step — slim down
- Keep hero, drop the duplicate "French banking, decoded ✨" headline (already on hero).
- Collapse the 5 explainer cards into 3 visual tiles in a 1-column stack with iconography doing the heavy lifting:
  1. "Two flavors" — split card visual (Traditional vs Neobank) with side-by-side icon tiles, one short line each.
  2. "Paperwork" — 3 mini doc chips (Passport, Address, Income) on a lemon card.
  3. "Speed" — clock illustration with "10 min vs 10 days" big-number contrast.
- Single CTA at the bottom. Remove all generic emojis (🛂📄💼🛋️⏰💡✨🎉🎯📋🔔🏦) — keep purposeful iconography via lucide.

### Recommend step
- Use `BankLogo` instead of `{bank.name[0]}` letter circle.
- Tighten metric tiles: switch to 3 lemon-tinted chips with monospace numbers.
- Replace coral stars with lemon-filled stars; rating text in lemon.
- Move "Documents needed" out of the card (collapsed) into a one-line summary chip ("3 docs needed →") that opens the bottom-sheet modal — keeps the card clean.
- Remove "Best match" coral pill in favor of a lemon corner ribbon.

### Apply step
- Replace orange→navy gradient block with `card-hero` + lemon left border.
- Remove `🎯 📋 🔔` emojis from headings.
- Step list: keep numbered lemon dots, but collapse "what to have ready" into the same flow rather than a separate card.

### Track step
- Remove `🎉 ⏳ ✓ 🔔` emojis.
- Bell row: use lucide `<Bell>` with a lemon background tile (already mostly the case), short copy.
- Tighten down: 3 cards instead of 5 (timeline + status + next-up). Drop "Mark account as ready (demo)" copy noise — just call the button "I got my card".

### Success step → route back to map
- Replace orange→navy gradient with `bg-gradient-lemon` on a black card.
- Remove "View my dashboard first" secondary path.
- Primary CTA "Back to your quest map →" → `navigate({ to: "/home" })`.
- Auto-redirect to `/home` after 2.5 s if user doesn't tap (keeps confetti time visible).
- Keep the +150 XP big-number animation.

## 4. Taxes level (`src/routes/level.taxes.tsx`)

### Intro
- Drop emojis: 😮‍💨 ⏰ ✉️ from copy.
- Consolidate 4 explainer cards into 3 visuals:
  1. Calendar visual showing Jan→Dec timeline with "Declare in spring" callout.
  2. Bracket bars (already nice — keep, lemon bars).
  3. Other taxes — 3 chip tiles (CSG, Habitation, TVA) in one row, single sentence each.
- Remove the "First year = paper" lemon card duplication; merge into a single line on the calendar visual.

### Plan
- Reduce text density: single recap card + one "estimated tax" big-number card with a lemon range bar.
- Drop the 4-line `<br/>` block, replace with 3 lemon-numbered mini steps (Paper → Form 2042 → Mail → May 31).

### Pack
- Trim doc list from 5 to 4 items (combine payslips + IBAN under "Money proofs"). Each row: lemon icon tile + 2-word label.
- Drop the `📄` emoji header.
- Remove "Centre des Finances Publiques" mock map (visual noise) — replace with a single "Find your nearest tax office" lemon-outline button.

### Completion
- After `addXp(200)` and `celebrate()`, change redirect from `/level/benefits` to `/home` (back to map). Map will surface Benefits as the new "current" section.

## 5. Benefits level (`src/routes/level.benefits.tsx`)

### Hero & list
- Keep money-rain hero (already on-brand).
- Strip emojis from card data: replace `emoji` field with a `lucide` icon per benefit (`Home`, `Train`, `ShoppingBag`, `Pill`/`HeartPulse`). Render as a lemon-tinted icon tile (h-12 w-12, gradient-lemon background, black icon) — premium, not generic.
- Remove "✓ Eligible" / "Check" emoji from pills (use icon-less pills).
- Big callout "~€2,100/yr" — keep, drop ✨ Sparkles eyebrow row's icon clutter, keep one line of text.

### Detail drawer
- Drop `Apply on caf.fr` external link generic feel: make it a primary lemon CTA "Start application →".
- Remove the closing italic line with the ⚡ emoji on tracking card; keep timeline only.
- Simplify "What you'll need" — 3 chips in a row instead of stacked rows with checks.

### Quest completion
- After tapping "Start application" on at least one eligible benefit, mark `setQuest({ benefitsClaimed: true })` and add a final success modal:
  - Cleo celebrating, "+200 XP", "All 3 levels complete!" big number, single CTA "Back to map →" → `navigate({ to: "/home" })`.
- Trigger `celebrate()`.

## 6. Quest map (`src/routes/home.tsx`) — minor

- After Benefits completes, the next-current node should highlight the Final Reward trophy (scroll-to + pulse) so returning to the map feels rewarding. Use `requestAnimationFrame` + `scrollIntoView({ behavior: "smooth", block: "center" })` when `quest.benefitsClaimed` is true and a `?from=benefits` param is present.
- No structural changes otherwise.

## 7. CCard, CButton tone polish (cute & premium)

- `CCard`: bump corner radius to 24 px on `tone="lemon"`, add subtle 1 px black inner stroke for tactile feel, soften shadow.
- `CButton`:
  - `primary`: keep lemon gradient, add subtle inset highlight (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 30px rgba(248,255,161,0.3)`).
  - `secondary`: switch to filled `bg-navy` with lemon text + lemon border (currently transparent — looks generic). Active state: lemon background flash.
  - `white` variant retired internally — replace usages with `primary`.

## Technical notes

- Files touched: `level.banking.tsx`, `level.taxes.tsx`, `level.benefits.tsx`, `home.tsx`, `CCard.tsx`, `CButton.tsx`, `styles.css` (button polish), new `BankLogo.tsx`.
- Use `useNavigate` from `@tanstack/react-router` to route back to `/home` at level completion.
- Persist `benefitsClaimed` in `useApp` (extend the `quest` slice with one boolean).
- Verify with `bunx tsc --noEmit` after edits.
- No new packages.

## Out of scope

- Real bank API logos as remote SVGs (we draw them inline to avoid CDN/asset failures).
- Dashboard, Deadlines, Profile (already in spec from prior pass; not part of this user-friendliness pass).
- Locked levels (Housing, Healthcare, etc.) keep their "Coming soon" treatment.
