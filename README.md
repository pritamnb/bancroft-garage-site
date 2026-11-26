# Bancroft Garage Ltd — preview website

Static website for Bancroft Garage Ltd (MOT and repairs, 193 Bancroft Road, London E1 4ET).
Plain HTML, CSS and JavaScript: no framework, no build step, no server.

Preview address: https://preview.bancroftgarage.co.uk

## Pages

| Path | Page |
|------|------|
| `index.html` | Home: hero, opening hours, quick quote, six featured services |
| `services/index.html` | All eleven services, each with a detail panel |
| `contact/index.html` | Callback / estimate form, workshop details, map |
| `404.html` | Not-found page |

## Files

- `assets/css/styles.css` — all styles
- `assets/js/site.js` — menu, open/closed badge, quick quote, service panel, contact form, assistant
- `assets/img/` — photos, icon sprite (`icons.svg`), favicon
- `CNAME` — custom domain for GitHub Pages
- `robots.txt` — blocks search engines while this is a preview

## Run it locally

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Hosting

Served by GitHub Pages from the `main` branch (root folder).
DNS: one `CNAME` record, host `preview`, pointing to `pritamnb.github.io`.
GitHub issues the SSL certificate automatically once the record resolves.

## Things that are deliberately "preview only"

- **Search engines are blocked** (`robots.txt` and a `noindex` tag on every page). Remove both at go-live.
- **The contact form does not send anything.** After validation it offers a pre-filled email to
  info@bancroftgarage.co.uk and the phone number. Connect a form service before go-live.
- **The assistant gives scripted answers** matched on keywords (opening hours, MOT, prices, location).
  It is not an AI model and makes no network requests.
- **Quick quote prices are guide prices** held in `assets/js/site.js` (`PRICES`). Confirm them with the garage.
- **Photos are stock or generated**, not the real workshop. Replace them with the garage's own photos.

## Credits

- Icons: [Lucide](https://lucide.dev) (ISC License)
- Fonts: Barlow Condensed, IBM Plex Sans, JetBrains Mono (SIL Open Font License, via Google Fonts)
- Photos: `workshop.jpg` and `technician.jpg` from Unsplash, `restoration.jpg` from Pexels,
  `hero.jpg` generated for the original site demo
