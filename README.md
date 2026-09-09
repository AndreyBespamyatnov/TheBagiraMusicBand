# BAGIRA official site

Static rebuild of [bagiraofficial.ru](https://bagiraofficial.ru/). No CMS, no browser UI framework, no Tailwind. Astro compiles RU/EN pages to a `dist/` folder you upload to static hosting.

## Scripts

```bash
npm install
npm run assets          # optional: re-download live logo/photos/covers
npm run dev
npm run build           # → dist/
npm run preview         # serves dist/ on http://127.0.0.1:4321
npm run check           # astro check
npm run test:e2e        # build + preview + Cypress (axe + viewports + snapshots)
npm run test:perf       # Lighthouse CI budgets against dist/
```

Upload the contents of `dist/` over the current site. Old `index.html` and `discography.html` URLs redirect to `/` and `/discography/`.

## Add a release

1. Put a square cover in `src/assets/covers/{slug}.jpg` (about 800px).
2. Add a row to `src/data/releases.json` (`title.ru` / `title.en`, `type`: `album` | `single` | `feat`, BandLink URL). Set `cover` to the filename stem (`lebedinaya-pesnya.jpg` → `"cover": "lebedinaya-pesnya"`).
3. `npm run build` and upload `dist/`.

## Add a show

Add an object to `src/data/tour.json`:

```json
[{ "date": "2026-12-01", "city": { "ru": "Казань", "en": "Kazan" }, "venue": { "ru": "Клуб", "en": "Club" }, "href": "https://band.link/bagiralive/" }]
```

An empty array shows the bilingual empty state plus the BandLink tickets button.

## Stack

- Latest Astro, `output: 'static'`
- Hero photo is `src/assets/hero.jpg`. Displayed like the live site: full landscape, `object-fit: cover`, position `50% 50%`.
- TypeScript **6.0.3** so `astro check` and the language server work. TypeScript 7’s native compiler is faster, but it does not export the JS language-service API that Astro still needs.
- Custom CSS tokens in `src/styles/global.css` (no Tailwind)
- Self-hosted Oswald + Manrope (Cyrillic + Latin)
- Cypress + cypress-axe + visual snapshots
- Lighthouse CI on the preview of `dist/`

Do not copy the old Mobirise `src/` tree onto this branch.
