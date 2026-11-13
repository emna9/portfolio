# Emna Smaali — Portfolio

A retro editorial portfolio — warm paper, ink, rust, condensed display type, giant name bands and a newspaper-style section system. Built to follow the design language of the `retro-portfolio` repo in `repo/retro-portfolio/`, with Emna's content.

Static site: no build step, no frameworks, no CDN calls. Fonts, images and artwork are local.

---

## Run it

Open `index.html` directly, or:

```bash
cd /home/emna/Documents/portfolio
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.

---

## The section split

All eight routes are visible in the masthead — there is no hamburger menu.

| # | Route | Section |
|---|-------|---------|
| 01 | Profile | bio, portrait, roles, fact file, stats |
| 02 | Work | four case files, three field notes, + the freshman archive |
| 03 | Record | six internships |
| 04 | Toolkit | AI / data / build / methods |
| 05 | Honors | three awards + nine certifications |
| 06 | Beyond | leadership, languages, interests |
| 07 | Studies | MedTech — SMU degree |
| 08 | Contact | email, phone, GitHub, LinkedIn, CV |

The hero also contains an **IN THIS ISSUE** contents block linking to all eight. The **Freshman file** archive sits inside Work: a standalone, clearly separated block at `#freshman`.

---

## Design language

- **Palette:** `#C4BCB3` paper, `#1C1C19` ink, `#B43B12` rust, `#CAC1B6` secondary paper.
- **Display type:** Domaine Display Condensed (included in the provided repo), with Instrument Serif italic for accents.
- **Body / meta:** Space Grotesk and JetBrains Mono.
- **Structure:** giant nameplate, three-column hero, dark section bands, rule-separated chapter heads, asymmetric editorial columns, oversized award ranks, seals, `NEW` tags, circular section button.
- **Marquee:** the “LET'S CREATE SOMETHING TOGETHER — EMAIL ME” band from the provided repo, kept as the contact signature.
- **Artwork:** custom SVG “plates” for each project, recoloured to the same paper/ink/rust palette, plus archival photographs and project screenshots from the freshman portfolio. No stock imagery.

Interactions: sticky section routes with active state, openable case files, image lightbox, copy-email button, live Tunis clock, marquee pause on hover, image hover scales. Respects `prefers-reduced-motion`; includes a print stylesheet.

---

## Structure

```
index.html                 all content
Emna_Smaali_CV.pdf         CV download
assets/
  css/style.css
  js/main.js
  fonts/                   Domaine, Instrument Serif, Space Grotesk, JetBrains Mono
  img/
    portrait.jpg           portrait card (replace with your photo)
    plate-01-voice.svg     project artwork
    plate-02-rag.svg
    plate-03-health.svg
    plate-04-commerce.svg
    plate-05-data.svg
    plate-06-api.svg
    archive-bank.jpg       freshman archive / BH Bank platform
    archive-dino.jpg       freshman archive / SDL2 game
    archive-dracode.jpg    freshman archive / Dracode screenshot
    archive-enactus.jpg    freshman archive / Enactus team
    archive-rota.jpg       freshman archive / Rotaract pin
    archive-art.jpg        freshman archive / painting
    favicon.svg
    og.jpg
repo/retro-portfolio/      the reference repo (unchanged)
```

### Portrait

`portrait.jpg` is the portrait from the freshman portfolio (2024), cropped to 4:5 and lightly upscaled for the web. Replace it with a newer, higher-resolution photo if you want:

- portrait crop, **900 × 1125 px** (or any 4:5 image)
- JPG
- same filename — no code changes needed

---

## Content notes

- Source material: the CV, the LinkedIn profile, the public GitHub repositories, and the freshman portfolio at <https://emnas-e-portfolio.weebly.com/>.
- **Six internships** includes the BH Bank internship from LinkedIn, in addition to the five on the CV. The BH Bank bullet now uses the fuller description from the freshman portfolio: the “Parties prenantes” stakeholder platform (PHP, MySQL, HTML/CSS, Figma).
- **Nine current certifications** are listed from LinkedIn, including the expired Java course so the record is complete. The earlier freshman certificates (C, Java classes & objects, Java abstraction, Weebly portfolio) and competitions (Compile Combat, IEEE WIE Hackathon) are kept in the Freshman file so the current list stays readable.
- **The Freshman file** adds the early Java/JavaFX/SDL2 projects, the Dracode shared-database work, IEEE RAS and Student Life membership, the Rotaract prosthetic-bras and RotaKids actions, the baccalaureate, coursework foundations, German (basic), and the art/pottery side.
- GitHub project links: `emna9/Chatbot` and `emna9/mental-health-risk-dashboard`.
- Key numbers come from the CV and the repositories:
  - 249 chunks · 7 insurance categories · FAISS + BM25
  - 10,000 synthetic records · 50 features · 0.6043 balanced accuracy
  - 800+ hackathons prepared · 8 analysis layers · 5 submissions
  - 6 internships · 3 podium finishes · 9 certifications
- The Voice-Based Service Request project is the “Smart Matching Platform” from the CV; the 1st-place announcement on LinkedIn uses the newer name.

---

## Live site

**https://emna9.github.io/portfolio/**  
Repository: **https://github.com/emna9/portfolio**

Deployed for free with GitHub Pages from the `main` branch. Every push to `main` republishes the site automatically (usually within a minute). The reference `repo/` folder and the Netlify zip are ignored, so they are not published.

## Update the live site

### From this computer

Edit anything in this folder — `index.html`, `assets/css/style.css`, `assets/img/...` — then run:

```bash
cd /home/emna/Documents/portfolio
./publish.sh
```

`publish.sh` commits the current changes and pushes them to GitHub. GitHub Pages then rebuilds the live site.

### From GitHub in the browser

Open **https://github.com/emna9/portfolio**, click the file you want to edit (or use **Add file → Upload files** for images), commit the change, and GitHub Pages will redeploy automatically.

### Add a new image

1. Put it in `assets/img/`.
2. Reference it from `index.html` as `assets/img/your-file.jpg`.
3. Run `./publish.sh`.

## Technical notes

- `og:image` and the canonical URL already point to `https://emna9.github.io/portfolio/`.
- The Domaine Display Condensed font comes from the reference repo. Check its licence before using it on a commercial/custom domain; swap it for a licensed alternative if needed.
- To use a custom domain later, add a `CNAME` file at the root with the domain and configure DNS; GitHub Pages will serve it.

---

## Credits

- Reference design: the `retro-portfolio` repo (a study of Niccolò Miranda's paper portfolio).
- Fonts: Domaine Display Condensed (from the reference repo); Instrument Serif, Space Grotesk and JetBrains Mono under the SIL Open Font License.
- Freshman source: <https://emnas-e-portfolio.weebly.com/>
- All portfolio artwork and code: custom for this site. The Freshman file images come from Emna's own freshman portfolio and are used as archival material.

---

## Sketch portfolio at /sketch/

A second, 3D sketchbook portfolio lives at <https://emna9.github.io/portfolio/sketch/>.

Its source code is on the **`sketch-source`** branch of this repo (Vite + React Three Fiber).
Every push to that branch triggers `.github/workflows/deploy-sketch.yml`, which builds it with
`--base=/portfolio/sketch/`, publishes the result into `sketch/` on `main`, and lets GitHub Pages
redeploy automatically.

```bash
git checkout sketch-source
# ...edit, then:
git add -A && git commit -m "..." && git push
```

Local preview: `npm install && npm run dev` inside the `sketch-source` branch checkout.

<!-- pages rebuild 1794597503 -->
