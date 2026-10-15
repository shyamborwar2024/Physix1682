# PHYSX ENGINEER

A responsive static frontend prototype for Online Engineering Physics Academy. Run it from a local web server; registration, test results, doubts and payment confirmations are browser-local demos, not production services.

## Complete project documentation

- [Website user and maintenance guide](docs/WEBSITE-GUIDE.md): page tour, local setup, settings, content updates, testing, troubleshooting, and pre-launch checklist.
- [Architecture overview](docs/ARCHITECTURE.md): diagrams and descriptions of pages, shared styles/scripts, data flow, browser storage, and the production boundary.
- [Step-by-step hosting guide](docs/HOSTING-GUIDE.md): free GitHub Pages and Netlify options, custom domains, paid cPanel hosting, DNS, HTTPS, updates, and checks.

## Run locally

Open the `engineering-physics-academy` folder in VS Code and use Live Server, or run `py -m http.server 8080` from this folder and visit `http://localhost:8080`. A web server is recommended because some browser features are restricted on `file://` pages.

The Three.js hero scene and Google Fonts use external CDNs. If those services are unavailable, the site content remains usable and the hero has a CSS illustration fallback.

The homepage's interactive Physics Lab showcase redraws its teaching models locally on a canvas. It recreates the double-slit, optical-fiber TIR, and quantum-well demonstrations from `Recording.mp4` and adds an illustrative quantum-tunneling model.

All website hero sections use a lightweight animated galaxy canvas with layered stars, glowing ringed planets, shooting stars, and pointer-reactive depth. It pauses outside the viewport and respects the device's reduced-motion preference.

PHYSX AI searches 500 English FAQs exported from `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.xlsx` to the browser-readable `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.json`. It also falls back to `data/physx-ai-knowledge-base.json`. Serve the site over HTTP (for example, with Live Server); browsers cannot fetch local datasets from a `file://` page. The workbook marks the draft answers for faculty review; treat them as study aids, not verified academic guidance.

## Change academy settings

Edit `data/config.js`:

- Prices: `regularSemesterPrice`, `offerSemesterPrice`, `fullYearRegularPrice`, and `fullYearOfferPrice`. Savings and discount labels are calculated from these values.
- WhatsApp: `whatsappNumber` (digits only); this also updates its social link.
- Email: `email`.
- UPI: `upiId`.
- Payment QR: `paymentQR`; replace `assets/qr/academy-payment-qr.png` with the academy's correct image, keeping the configured relative path.
- Schedule: `classStart`, `classEnd`, `classDays`, `holidays`, and `timezone`.
- Links and locations: `socialLinks`, `liveClassLink`, `demoGoogleForm`, and `locations`. Social URLs currently point to platform homepages as demos; replace them with the academy's official profile URLs before publishing.

Verify payment details and the QR destination with the payment account owner before publishing. The included QR is the image supplied for this project. The static site does not verify UPI transfers.

## Update learning content

- University choices used by the live forms: `data/config.js` (`universities`). Keep the descriptive names in `data/universities.json` aligned when changing that list.
- Course overview: `data/courses.json`, `courses.html`, and the semester pages.
- Faculty profile: `faculty.html` and `assets/images/faculty-shyam-borwar.jpeg`.
- Published books: the faculty page displays the supplied cover references for *Applied Physics for MU* and *Semiconductor Physics*.
- PHYSX AI knowledge base: `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.json` is the primary public data loaded by the assistant; regenerate it from `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.xlsx` when FAQs are revised. The older `data/physx-ai-knowledge-base.json` remains as a fallback.
- Services overview and menu destinations: `services.html` and the shared navigation in `js/site-shell.js`.
- Demo syllabus: `js/syllabus.js`, clearly labelled as illustrative; verify against current official university material before making academic claims.
- Demo questions: `js/tests.js`; scores are saved to this browser's local storage.
- Study materials: update `study-material.html` when reviewed files are ready; current download controls intentionally explain that files are not uploaded.
- Faculty profile: `faculty.html`; publish credentials or professional links only after verification.
- Social links and class links: `data/config.js`.

## Demo workflows and limitations

Registration continues to the manual UPI instructions and stores a local demo record. A payment confirmation stores only metadata locally; its selected screenshot is not uploaded or retained. The dashboard and admin preview can read this browser's demo data. The admin page is not protected and must never be exposed as a production administration tool.

The PHYSX AI page and floating site-wide assistant search the local FAQ dataset, then use general study guidance for unmatched questions; they do not call a live AI model. The supplied FAQ workbook marks its answers as needing faculty review. Do not put AI secrets in browser code. Doubt submissions are not sent to faculty. No authentication service, live video, PDF library, database, payment gateway or certificate issuer is connected.

## Production integration checklist

1. Add a backend for accounts, input validation, authorization, audit logs, rate limits and secure file storage. Do not use local storage as a source of truth for student records.
2. Integrate a payment provider on the server; validate signed webhooks before changing enrollment status. Never collect or store raw card data in this frontend.
3. Add a server-side AI proxy and reviewed physics content. Keep provider keys on the server.
4. Configure real class links, recordings, verified faculty details, course materials, official syllabus mappings, and policy text.
5. Obtain legal review for privacy, terms, refund and payment policies. Review consent, retention and upload handling before accepting real user data.
6. Replace `your-domain.com` in `index.html`, `js/site-shell.js`, `sitemap.xml`, and `robots.txt` after choosing a domain.
7. Deploy to GitHub Pages, Netlify or Vercel as a static preview only; configure HTTPS and backend services separately before production use.
