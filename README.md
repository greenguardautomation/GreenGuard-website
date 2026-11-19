# GreenGuard Automation Website

Company website for GreenGuard Automation: the Ecoray laser weeder.

**Live site**: [greenguardautomation.com](https://greenguardautomation.com)

## Pages

| File | URL | What it is |
|---|---|---|
| `index.html` | `/` | Home: full-screen product panels |
| `ecoray.html` | `/ecoray` | Ecoray product page, how it works, specifications |
| `reserve.html` | `/reserve` | "Get a quote" form in English, prices in euros |
| `reserver.html` | `/reserver` | "Få et tilbud" form in Danish, prices in kroner. The brochure and flyer QR code (`/e1`) sends Danish phones here |
| `technology.html`, `support.html` | `/technology`, `/support` | How Ecoray works, questions and answers |
| `da/*.html` | `/da/…` | The Danish version of the home, Ecoray, technology, support and company pages |
| `about.html` | `/about` | Who we are, team, supporters, contact |
| `privacy.html`, `terms.html` | | Legal pages |
| `m/index.html` | `/m` | Owner support page behind the nameplate QR code. Never delete. |
| `404.html` | | Shown for any unknown address |
| `e1/index.html` | `/e1` | QR-code redirect from the machine nameplate. Never delete. |

## Danish and English

English pages sit in the root folder and show prices in euros. Danish pages sit in `da/` and show prices in kroner. A visitor whose browser is set to Danish is sent to the Danish page automatically; the "Dansk" / "English" link in the header switches language and is remembered. When you change a text, change it in both the English page and the Danish page with the same file name in `da/`.

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

GitHub Pages cannot run server code, so the reserve form is sent through [Web3Forms](https://web3forms.com). Every submission is emailed to the inbox of the Web3Forms account that owns the access key in `assets/js/reserve.js` (the company's shared inbox). To send to another inbox, change it in that Web3Forms account, or create a new access key and replace `ACCESS_KEY`.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Hosted via GitHub Pages. Merging into `main` publishes the site.
