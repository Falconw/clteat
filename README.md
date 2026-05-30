# TechSys — Website (Phase 1)

> **Engineered Clarity.** A premium, enterprise-grade marketing site for TechSys — built as a scalable design system, not a set of disconnected pages.

Static HTML/CSS/JS. Zero build step, instant preview, deploys to any host (Netlify, Vercel, GitHub Pages, or the current host). Architected so Phase 2 motion can be layered in without touching markup.

---

## Run / preview

It's static — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Deploy

Upload the repository root as-is. No build. Drag-and-drop to Netlify, or point any static host at the root.

---

## Structure

```
/
├── index.html          Home  (hero · message · services · approach · clients · CTA)
├── about.html          About (who/believe/mission/approach/why/values)
├── services.html       Services (6 detailed service rows + quick index)
├── contact.html        Contact (info + validated form + map placeholder)
├── assets/
│   ├── css/styles.css  Design system: tokens → base → components → pages → motion
│   ├── js/main.js      Nav, mobile menu, reveal-on-scroll, form validation
│   └── img/favicon.svg The engineered "TE" monogram
└── README.md
```

Nav + footer markup is intentionally inlined per page (SEO-safe, no flash-of-missing-content). Keep them in sync, or migrate to includes/components when you adopt a build step.

---

## Brand system (source of truth: TechSys Brand Guidelines v1.0)

**Idea:** *Engineered Clarity* — precise, clear, dependable. Discipline = **restraint**: one teal signal per composition, generous clear space, deliberate geometry.

### Colour (CSS variables in `:root`)
| Token | Hex | Use |
|---|---|---|
| `--navy` Quantum Navy | `#082A3A` | primary dark / text / buttons |
| `--obsidian` | `#071A24` | deepest surfaces, hero, footer |
| `--graphite` | `#1D282F` | dark surface |
| `--teal` Electric Teal | `#00C2A8` | **the single accent signal** |
| `--porcelain` | `#FBFAF6` | primary light background |
| `--ice` Ice Mist | `#EAF7F5` | tinted section background |
| `--cloud` Cloud Silk | `#F5F2EA` | text on dark |
| `--slate` Cool Slate | `#60777D` | muted text |
| `--lime` / `--amber` | `#D6FF3F` / `#FFB000` | reserved micro-accents |

> **Teal discipline:** teal is used once per composition as the "signal" — kicker accents, one primary CTA, hover states, a single node in graphics. Don't flood it.

### Typography (Google Fonts)
- **Sora** — display & headings
- **Manrope** — body & interface
- **JetBrains Mono** — kicker labels, data, the `01 — SECTION` device
- *IBM Plex Sans Arabic* — reserved for RTL/Arabic (Phase 2 bilingual)

### Logo
- **Wordmark** `.wordmark` — Sora letters with the engineered "E" (three bars, middle bar teal). Navy on light, Cloud Silk on dark. *Never redraw the E.*
- **Monogram** `assets/img/favicon.svg` — the slanted "TE" with the teal signal bar.

---

## Component system (CSS classes)

| Component | Class | Notes |
|---|---|---|
| Buttons | `.btn` + `--primary/--teal/--ghost/--ghost-dark/--on-dark` | pill, hover lift |
| Kicker / eyebrow | `.kicker` (`--plain`) | mono label with rule |
| Container / section | `.container` (`--narrow`) · `.section` (`--tight`) | spacing rhythm |
| Surface themes | `.bg-light .bg-ice .bg-dark .bg-obsidian` | auto colour inversion |
| Service card | `.service-card` | custom line icon, engineered corner |
| Client logo card | `.client-card` | branded gradient + grid + teal overlay |
| Value / belief panel | `.value-card` · `.belief` | |
| Stat | `.stat` | |
| Hero | `.hero` + `.sysviz` | full-viewport, system-lines SVG |
| Page header | `.pagehead` | inner-page hero |
| Service detail row | `.svc-row` | sticky head + content |
| CTA band | `.cta-band` | gradient panel + aura |
| Form | `.form-card .field` | validation + status states |
| Footer | `.footer` | branded blueprint pattern |
| Blueprint graphic | `.blueprint` (`--dark`) · `.aura--teal` | reusable backgrounds |
| Motion | `.reveal` + `data-d="1..5"` | IntersectionObserver stagger |

To add a section: pick a `.bg-*` theme, open a `.container`, lead with a `.kicker` + `h2`, drop components in a `.grid`, and mark items `.reveal`.

---

## Phase 2 roadmap

**Motion** (the seam is ready): the `.reveal` + `data-d` hooks and `[data-*]` units in `main.js` are isolated. Drop in GSAP/ScrollTrigger or Lottie and bind to the same hooks — markup stays untouched. Respect the existing `prefers-reduced-motion` guard.

**Form backend:** wire `[data-contact-form]` submit to Formspree or an API route (marked `// Phase 2` in `main.js`).

**Bilingual / RTL:** IBM Plex Sans Arabic is reserved; add `dir="rtl"` + a logical-properties pass.

**Future pages** (reuse the same system): Projects / Case Studies · Industries · Managed IT Support · Procurement · Careers · Insights (Blog) · Client Portal · Support Request · FAQ.

---

*Built to feel designed, not assembled.*
