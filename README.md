# GreenGuard Automation Website

Company website for GreenGuard Automation: the Ecoray laser weeder.

**Live site**: [greenguardautomation.com](https://greenguardautomation.com)

## Pages

| File | URL | What it is |
|---|---|---|
| `index.html` | `/` | Home: full-screen product panels |
| `ecoray.html` | `/ecoray` | Ecoray product page, how it works, specifications |
| `reserve.html` | `/reserve` | Reserve/order form for the 2027 season |
| `about.html` | `/about` | Who we are, team, supporters, contact |
| `privacy.html`, `terms.html` | | Legal pages |
| `da/*.html` | `/da/…` | Danish versions of the four main pages |
| `m/index.html` | `/m` | Owner support page behind the nameplate QR code. Never delete. |
| `404.html` | | Shown for any unknown address |
| `e1/index.html` | `/e1` | QR-code redirect from the machine nameplate. Never delete. |

Every page is plain HTML. To change a text, open the page on GitHub, click the pencil icon, edit the words between the tags, and commit. The change is live in a few minutes.

## Assets

```
assets/
├── css/site.css      # all styles (colours and fonts are defined at the top)
├── js/site.js        # navigation and mobile menu
├── js/reserve.js     # reserve form (sends to the inbox set in RECIPIENT)
├── fonts/            # Archivo, self-hosted (no Google Fonts request)
├── media/            # optimised images and video used by the pages
└── img/brand/        # logo and favicons
```

Images in `assets/media/` exist as `.webp` plus a `.jpg` fallback. Keep new images under ~300 KB: resize to at most 2400 px wide before adding them.

Videos in `assets/media/`:
- `field-loop.mp4` / `field-loop-sm.mp4`: silent 15-second background loop of field footage (desktop / mobile)
- `ecoray-film.mp4`: the 34-second Ecoray film, opened by the "Watch the film" buttons
- `field-trial-film.mp4`: the field trial film (Danish captions) on the Ecoray page

## Reserve form

GitHub Pages cannot run server code, so the reserve form is sent through [FormSubmit](https://formsubmit.co) to the address in `assets/js/reserve.js`. The very first submission to a new address triggers a one-time activation email from FormSubmit; click the link in it, and later submissions arrive normally.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Hosted via GitHub Pages. Merging into `main` publishes the site.
