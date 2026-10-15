# PHYSX ENGINEER website guide

This guide explains how to run, understand, update, and check the Engineering Physics Academy website.

## 1. What this project is

This folder contains a static website: HTML pages, CSS, JavaScript, JSON data, and image/icon assets. It does not require Node.js, a build step, or a database to preview or deploy.

The current registration, dashboard, test, payment-confirmation, doubt, and assistant flows are demonstrations that run in the visitor's browser. They do not send records to the academy. See [Architecture](ARCHITECTURE.md) for the data-flow diagram and [Hosting guide](HOSTING-GUIDE.md) before publishing.

## 2. Open and preview the site

### Option A: VS Code Live Server

1. Open this `engineering-physics-academy` folder in VS Code.
2. If needed, install the **Live Server** extension from Microsoft's Visual Studio Marketplace.
3. In Explorer, right-click `index.html` and select **Open with Live Server**.
4. The browser opens a local address, often `http://127.0.0.1:5500/`.

### Option B: Python's built-in server

1. Open PowerShell.
2. Change to the website folder (adjust the path if you moved it):

   ```powershell
   Set-Location -LiteralPath "C:\Users\Onkar\OneDrive\Desktop\Online Engineering Physics Academy\engineering-physics-academy"
   ```

3. Start the server:

   ```powershell
   py -m http.server 8080
   ```

   If the `py` command is unavailable but Python is installed, use `python -m http.server 8080`.

4. Visit `http://localhost:8080/` in your browser.
5. To stop the server, return to PowerShell and press **Ctrl+C**.

Do not double-click HTML files for normal testing. A local HTTP server avoids restrictions browsers place on some features loaded from `file://`.

## 3. Project map

| Location | What it contains |
| --- | --- |
| `index.html` | Academy homepage, course pricing, social links, and main calls to action. |
| Other root `*.html` files | Individual public course, syllabus, class, contact, registration, student-demo, policy, and learning-tool pages. |
| `css/` | Base theme, components, responsive rules, animation rules, and site-specific styles. |
| `js/` | Shared site shell and page features such as registration, payments, quizzes, results, schedule, dashboard, simulations, and the local assistant. |
| `data/config.js` | Academy contact, prices, schedule, payment, locations, university choices, and social profile destinations. |
| `data/courses.json`, `data/universities.json` | Course and descriptive university data. |
| `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.xlsx` | The source PHYSX 500-FAQ workbook. |
| `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.json` | Browser-readable export of the workbook's 500 English Q&As, loaded by the assistant. |
| `data/physx-ai-knowledge-base.json` | Fallback copy of the FAQ dataset. |
| `assets/` | Source FAQ workbook and export, supplied payment QR, academy icon, faculty profile photo, and published-book cover reference. |
| `admin/index.html` | Unauthenticated, local-browser admin preview. Do not publish as a real admin system. |
| `docs/` | This website guide, architecture explanation, and hosting instructions. |
| `manifest.json`, `robots.txt`, `sitemap.xml` | Install metadata and search-engine/deployment metadata. Replace example-domain values before public launch. |

### Page inventory

| Page(s) | Purpose |
| --- | --- |
| `index.html` | Home, offer/pricing, course links, FAQs, social/contact calls to action, and the interactive four-model Physics Lab showcase. |
| `about.html`, `faculty.html`, `gallery.html` | Academy information, the full faculty profile/photo and book publications, and gallery/demo content. Verify profile claims and media before launch. |
| `services.html` | Service overview with anchored details for academic mentoring, research guidance, publication support, and project mentoring. |
| `courses.html`, `semester-1.html`, `semester-2.html`, `syllabus.html` | Course overview, semester descriptions, and illustrative syllabus browsing. |
| `classes.html`, `recorded-classes.html`, `study-material.html`, `physics-lab.html` | Schedule, recording/material placeholders, and interactive browser simulations. The homepage showcase recreates double-slit interference, optical-fiber TIR, and a quantum well from the supplied parent-folder `Recording.mp4`, plus an illustrative quantum-tunneling model. Check for real links/files before promoting these as services. |
| `tests.html`, `results.html`, `ai-assistant.html`, `demo.html` | Practice test/result demo, local assistant demo, and free-demo content. |
| `contact.html`, `faq.html` | Contact details, social links, and common questions. |
| `register.html`, `payment.html`, `payment-confirmation.html` | Browser-local enrollment and manual-payment demonstration only. |
| `login.html`, `dashboard.html`, `profile.html`, `payment-history.html`, `certificates.html`, `doubts.html` | Student-account/tool previews backed by browser data, not secure accounts or a server. |
| `privacy.html`, `terms.html`, `refund-policy.html`, `disclaimer.html` | Policy/disclaimer pages. Review and adapt them to the actual service before launch. |
| `admin/index.html` | Unauthenticated local admin preview; exclude from any public deployment. |

## 4. Change the academy's settings

Edit `data/config.js` using a plain-text/code editor. Keep strings in quotes, commas between object properties, and arrays inside square brackets. Save the file and refresh the browser.

Important settings:

- `brandName`, `brandShortName`, `tagline`: public brand labels.
- `email`, `whatsappNumber`: academy contact methods. WhatsApp is digits only, including the country code, without `+` or spaces.
- `regularSemesterPrice`, `offerSemesterPrice`, `fullYearRegularPrice`, `fullYearOfferPrice`: fee values in INR. Visible savings/discounts are derived from these prices.
- `upiId`, `paymentQR`: displayed manual-payment details and relative QR image path. Check the UPI recipient and scan the QR using the payment account owner's app before publishing.
- `classStart`, `classEnd`, `classDays`, `holidays`, `timezone`: displayed schedule.
- `universities`, `academicPatterns`, `semesters`: form and learning selectors.
- `socialLinks`: Instagram, LinkedIn, YouTube, Facebook, X/Twitter, and Telegram. Current URLs are platform demo destinations, not academy profiles. Replace them with complete official `https://` profile URLs.
- `locations`, `liveClassLink`, `demoGoogleForm`: location and optional destination settings.

The WhatsApp social button is generated from `whatsappNumber`, so changing the number updates that button as well.
Inquiry buttons open WhatsApp with a prefilled message for their topic. The current 10-digit academy number is converted to the Indian `+91` format for WhatsApp URLs. Confirm the business number and test each link before launch.

### PHYSX AI FAQ dataset

The floating assistant and the standalone assistant page load `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.json` first, then fall back to `data/physx-ai-knowledge-base.json`. This browser-readable JSON export is generated from the source workbook `assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.xlsx`; browsers cannot search an Excel workbook directly. When revising FAQ content, regenerate the JSON export from the workbook and keep the fallback copy synchronized. Serve the site over HTTP (for example, Live Server or `py -m http.server`); browser fetch is blocked when pages are opened directly through `file://`. The workbook marks its answers as needing faculty review; do not present them as reviewed or authoritative until a qualified faculty member has approved them. No questions are sent to an AI provider.

## 5. Update pages and learning materials

1. Edit the relevant HTML page for page text and page-specific structure.
2. Use `data/config.js` for settings shared across pages; avoid repeating editable values in many pages.
3. `js/site-shell.js` adds shared navigation, footer, social icons, the floating assistant, shared CSS, and common behavior to the regular site pages.
4. `js/home-lab-showcase.js` draws the homepage's four adjustable canvas experiments; `js/physics3d.js` powers the full Physics Lab and optional Three.js scene. `js/registration.js`, `js/payment.js`, `js/tests.js`, `js/results.js`, and `js/student-tools.js` implement the other browser demos.
5. The syllabus is explicitly illustrative. Verify each topic against the current official university syllabus before describing it as official.
6. Study-material download controls are placeholders until actual, reviewed files are provided.
7. Publish faculty credentials, student results, testimonials, or outcomes only after verifying their accuracy and receiving any necessary consent.

## 6. Check changes before publishing

1. Start the local server using section 2.
2. Visit the homepage and each changed page; check the desktop and narrow-mobile layout.
3. Test the menu, Faculty/Our Services/Contact navigation and service dropdown, WhatsApp topic links, themes, and assistant launcher.
4. Test registration and payment only with fictional/demo data. The browser stores demo records locally.
5. Try one test and one lab simulation if either feature changed.
6. Check the browser developer console for missing files or JavaScript errors.
7. Check that every page image loads, especially `assets/qr/academy-payment-qr.png`, the faculty photo, and the two published-book cover crops.
8. Review [Hosting guide](HOSTING-GUIDE.md), remove demo-only pages/assets that should not be public, and complete the pre-launch list below.

For JavaScript syntax checks with Node.js installed, run this in PowerShell from the project root:

```powershell
Get-ChildItem .\js\*.js | ForEach-Object { node --check $_.FullName }
```

## 7. Important current limitations

- **No server or database:** browser `localStorage` is specific to one browser/device and can be cleared or edited. It is not a secure or shared student record.
- **No real account authentication:** the sample login/dashboard is not an access-control system.
- **No payment processing or verification:** the site displays manual UPI instructions. A saved confirmation is not proof that a payment was received.
- **No file upload:** a selected screenshot is not sent to the academy.
- **No live AI:** the floating assistant and PHYSX AI page search the local 500-entry FAQ and use basic general-study responses; they do not call a live AI service. FAQ entries require faculty review.
- **No live teaching integration:** configured-looking class destinations must be replaced with actual, permission-controlled meeting/material links.
- **No protected admin page:** `/admin/` has no login and can be opened by anyone if deployed. `robots.txt` and `noindex` are not security controls.
- **Example SEO domain:** canonical metadata, structured data, `sitemap.xml`, and `robots.txt` still contain `your-domain.com` until updated.
- Google Fonts and the Three.js homepage illustration load from external CDNs; visual/content fallbacks are available if those services are unavailable.

Do not use this static prototype to collect real student data, store private records, confirm enrollment, accept uploads, or make payment/access decisions. A production version needs a secure backend, database, authentication/authorization, secure file handling, payment-provider integration, server-side verification, and reviewed legal/privacy documents.

## 8. Pre-launch checklist

- [ ] Replace every demo social URL with the academy's official profile URL.
- [ ] Verify the phone, email, payment UPI ID, and QR recipient.
- [ ] Confirm prices, course inclusions, refund terms, and class schedule.
- [ ] Provide verified faculty information, official syllabus references, real course files, and working class links.
- [ ] Replace `your-domain.com` in `index.html`, `js/site-shell.js`, `sitemap.xml`, and `robots.txt` with the final HTTPS domain.
- [ ] Remove `/admin/` from the deployed website unless it is replaced by a properly authenticated, server-backed admin application.
- [ ] Remove or clearly label any other demo-only student/payment/assistant pages that should not be public.
- [ ] Obtain legal review for privacy, terms, and refunds; ensure policies match the actual service.
- [ ] Add backend services before handling actual enrollments, personal data, uploads, AI credentials, or verified payments.
- [ ] Follow [Hosting guide](HOSTING-GUIDE.md) and verify the deployed HTTPS site on mobile and desktop.
