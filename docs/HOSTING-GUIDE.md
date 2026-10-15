# Step-by-step hosting and publishing guide

This project is a static website. You can publish the current frontend without paying for a web server. A custom domain normally costs money even when the web hosting is free. Provider plans, menus, and prices can change; check the provider's current official documentation and checkout total before purchasing.

## First: know what hosting will and will not do

Hosting publishes HTML, CSS, JavaScript, and images so people can open the site at a URL. It does not create a backend for this project.

**The current registration, login, dashboard, assistant, tests, payment confirmations, and doubts are frontend demos.** They do not securely submit information to the academy, authenticate users, verify payments, or share data between visitors. Do not advertise or operate them as real services until backend integrations are implemented and tested.

The `/admin/` page is public and has no authentication. It only reads local browser data. Remove it from the deployed copy; `robots.txt` or hiding its link does not protect it.

## Before publishing: prepare the website

1. Open and test the site locally using [the website guide](WEBSITE-GUIDE.md).
2. In `data/config.js`, replace all social demo URLs with official academy profiles. Confirm the email, WhatsApp number, prices, schedule, UPI ID, and QR image.
3. Verify that the QR belongs to the correct payment account. Do not claim that the website verifies payments.
4. Replace placeholder class links, course material, and unverified faculty/syllabus details. Remove claims about features that are not available.
5. Review every policy page with a qualified reviewer. Template/demo wording is not legal advice.
6. Decide whether demo pages such as `login.html`, `dashboard.html`, `payment*.html`, `doubts.html`, `admin/`, and the local AI demo should be public. Remove demo-only items from the **deploy copy** if visitors could mistake them for operational features.
7. Choose and register a domain if you want a custom address such as `example.in`. A domain and hosting are separate products; a free host may provide a temporary provider subdomain.
8. After choosing the final domain, update all SEO placeholders:
   - `index.html`: the canonical `<link>` URL.
   - `js/site-shell.js`: `canonicalUrl` and the structured-data `url`.
   - `sitemap.xml`: every `https://your-domain.com/...` address.
   - `robots.txt`: the sitemap URL.
9. Do not put credentials, private API keys, or real student/payment details into project files or Git history. All frontend source is downloadable by visitors.

## Option A — Publish free with GitHub Pages

This is a good free option for a version-controlled static site. A public GitHub repository makes the website source public as well. GitHub's free-plan and Pages rules may change, so verify the current official plan limits.

### A1. Create an empty GitHub repository

1. Sign in at [github.com](https://github.com/) or create an account.
2. Select **New repository**.
3. Enter a repository name, for example `engineering-physics-academy`.
4. For the simplest free GitHub Pages setup, make the repository **Public**. Do not upload private data.
5. Leave **Add a README**, `.gitignore`, and license unchecked if you plan to push this existing folder from PowerShell; this avoids an unrelated first-commit merge.
6. Create the repository and keep its HTTPS URL handy. It will look like `https://github.com/YOUR-USERNAME/engineering-physics-academy.git`.

### A2. Upload this project from Windows PowerShell

1. Install Git for Windows if the `git` command is not available.
2. Open PowerShell and change into the project folder:

   ```powershell
   Set-Location -LiteralPath "C:\Users\Onkar\OneDrive\Desktop\Online Engineering Physics Academy\engineering-physics-academy"
   ```

3. Initialize and commit the files:

   ```powershell
   git init
   git add .
   git commit -m "Publish Engineering Physics Academy website"
   git branch -M main
   ```

4. Add the remote, replacing the example username/repository with the URL from step A1:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/engineering-physics-academy.git
   git push -u origin main
   ```

5. If Git asks who made the commit, configure the name/email that should appear on your commits:

   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "YOUR-EMAIL"
   ```

   Then retry `git commit` and `git push`. GitHub may open a browser sign-in prompt.

> If you already initialized Git or added a remote, do not repeat `git init`/`git remote add`. Inspect with `git status` and `git remote -v` first.

### A3. Enable the website

1. On GitHub, open the repository.
2. Select **Settings** → **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/(root)`, then save.
5. Wait for the Pages deployment to finish. GitHub shows the published address on the Pages settings screen.
6. A project repository usually publishes at `https://YOUR-USERNAME.github.io/engineering-physics-academy/`. The account's special `YOUR-USERNAME.github.io` repository publishes at the root address `https://YOUR-USERNAME.github.io/`.
7. Open the published URL on desktop and mobile. Confirm images, styles, navigation, QR, and page reloads work.

Relative page/assets paths are used throughout the project. The PWA manifest is configured with relative start/scope paths to support a project subpath. Do not replace relative asset paths with leading-slash paths unless the site will always be mounted at a domain root.

### A4. Publish future updates

From the project folder:

```powershell
git add .
git commit -m "Describe the website update"
git push
```

GitHub Pages automatically builds/publishes the new committed files. Check the repository's **Actions** tab or **Pages** settings if the update does not appear. A browser hard refresh can bypass its old cached copy.

### A5. Optional custom domain

1. Register the domain with a registrar and add it in the repository **Settings** → **Pages** → **Custom domain**.
2. Follow the DNS record values GitHub currently shows for your exact setup. DNS instructions can differ for an apex domain (`example.com`) and a subdomain (`www.example.com`); do not guess or copy old IP addresses from an unrelated guide.
3. Wait for DNS to propagate and for GitHub to verify the domain.
4. Enable **Enforce HTTPS** when GitHub makes it available.
5. Replace SEO placeholders in the project with the final HTTPS address and push the change.

## Option B — Publish free with Netlify's manual deploy

This is a convenient way to preview without Git. The account/subdomain and usage limits are controlled by Netlify's current plan; verify current terms.

1. Complete the pre-publishing checks above.
2. Sign in/create an account on [netlify.com](https://www.netlify.com/).
3. In the Netlify dashboard, start a new site deployment using its current **manual deploy** or **drag-and-drop** workflow.
4. In File Explorer, open the `engineering-physics-academy` folder.
5. Upload/drag the **site files and folders** so `index.html` is at the deploy root. Do not drag only the parent folder if that would make `index.html` one level too deep.
6. Wait for deployment and open the Netlify-provided HTTPS URL.
7. Verify the homepage and several subpages, then test mobile layout and images.
8. To update a manual deployment, upload the updated site files again using Netlify's current manual-deploy flow.
9. For automatic deploys, connect a GitHub repository through Netlify's **Add new site / Import from Git** flow, set the publish directory to the repository root, and leave the build command empty for this no-build static site.
10. For a custom domain, add the domain in Netlify's domain settings and copy the DNS values it provides into your registrar's DNS panel. Enable HTTPS after verification.

Avoid uploading private working data, browser exports, or secrets. The `docs/` folder contains these project guides; if you prefer not to make them public, exclude that folder from a manually prepared deploy copy.

## Option C — Paid domain plus paid shared hosting/cPanel

This is suitable if you want a conventional hosting account with a control panel. Prices, renewal rates, storage, bandwidth, email, backup, SSL, and support vary by provider and plan. Check the renewal total and terms, not just the first-term promotion. Hosting is not a backend application.

### C1. Purchase and connect the domain

1. Choose a domain name and registrar. Check spelling, renewal price, privacy/renewal terms, and that the account/registrant is controlled by the academy.
2. Purchase a shared Linux hosting plan that explicitly supports static HTML files, HTTPS, and a control panel such as cPanel. No PHP/database plan is needed for this frontend alone, though you may choose one for later backend work.
3. In the hosting dashboard, attach the domain to the hosting account as its primary domain or an addon domain.
4. Copy the exact DNS instructions from the hosting provider.
5. At the registrar, either change nameservers to the host's specified nameservers or enter the host's requested DNS records. Use one documented method; don't add guessed records.
6. Wait for the provider to confirm that the domain points to the hosting account. DNS changes may take time to propagate.

### C2. Upload the static site with cPanel File Manager

1. Complete the content and domain/SEO preparation above.
2. Make a backup copy of the current hosted site before replacing files.
3. Sign in to the hosting control panel using its official HTTPS address.
4. Open **File Manager** and the domain's document root. For a primary domain this is often `public_html`; addon domains may use a different folder. Confirm the exact root in the hosting dashboard.
5. Make sure the final copy has `index.html` directly in this document root. Avoid nesting it as `public_html/engineering-physics-academy/index.html` unless the host is deliberately configured for that subfolder.
6. In Windows File Explorer, select the website files/folders to publish. You can create a ZIP archive of the selected contents (not an extra enclosing parent folder).
7. Upload the ZIP in File Manager, select it, and choose **Extract**. Alternatively, upload the files/folders directly if the hosting panel supports it.
8. Confirm `index.html`, `css/`, `js/`, `data/`, and `assets/` are in the document root. Exclude `.git/` and any private backups. Remove `admin/` from the public deployment unless it has been replaced with a secured application.
9. In the hosting dashboard, enable its free/included SSL certificate for the domain if available. Wait until certificate provisioning completes.
10. Open `https://YOUR-DOMAIN/`, not only `http://`, and check the pages/assets. If the host has a redirect setting, enable HTTP-to-HTTPS only after HTTPS works.
11. Replace SEO placeholders with the real domain and upload the changed files again.

### C3. Update the cPanel site later

1. Keep the local project as the source copy and back it up before edits.
2. Test changes locally.
3. Upload the changed files/folders into the same document root and confirm overwrite prompts are intentional.
4. Avoid overwriting host-specific DNS/SSL settings; those are managed in the hosting panel, not in this folder.
5. Test the published site and use a hard refresh if a browser cache shows old files.

## Option D — Free hosting, paid custom domain

You do not have to buy a paid web-hosting plan just to use a custom domain. A common low-cost setup is:

1. Publish the static files on GitHub Pages or Netlify's free tier.
2. Purchase a domain separately from a registrar.
3. Connect the domain using the host's exact DNS instructions.
4. Enable HTTPS and update SEO URLs.

This pays for the domain registration/renewal, while static hosting may remain free within current provider limits. Confirm DNS control, renewal cost, and current free-plan terms.

## After deployment: verification checklist

- [ ] `https://YOUR-SITE/` opens without a certificate warning.
- [ ] Refreshing a page such as `/courses.html` works, and navigation returns to the correct pages.
- [ ] Homepage styles, fonts/fallbacks, icons, QR image, social icons, and floating assistant load.
- [ ] At narrow mobile width, there is no unexpected horizontal page overflow.
- [ ] All displayed email/phone/social URLs and the QR/UPI destination have been checked.
- [ ] The browser console has no missing local files or script errors.
- [ ] Placeholder `your-domain.com` URLs have been replaced before requesting search indexing.
- [ ] `/admin/` is not deployed as an unauthenticated public page.
- [ ] No visitor is led to believe browser-local demo data is sent, secure, or payment-verified.
- [ ] You retain a backup and can repeat the deployment/update process.

## Troubleshooting

| Symptom | Likely cause and action |
| --- | --- |
| Site shows a directory listing or 404 | The host's document root is wrong or `index.html` is one folder too deep. Put the contents of this project directly in the published root. |
| Page loads without styling | Check that `css/` was uploaded with exact names/case and that CSS requests return successfully. |
| QR/icon missing | Confirm `assets/qr/academy-payment-qr.png` and `assets/icons/physx-icon.svg` exist at the matching relative path. |
| Some JavaScript features are absent | Check browser console/network requests for missing `js/` or `data/config.js`; keep the project directory structure intact. |
| A project-site PWA opens the wrong URL | Confirm the current manifest uses relative `./index.html` and `./` values, then clear cached site data/reinstall the PWA. |
| Custom domain not opening | Re-check DNS values with both registrar and hosting dashboards, allow time for propagation, then verify HTTPS certificate status. |
| Update not visible | Confirm the latest files were committed/deployed or uploaded to the correct site, then hard-refresh or clear the browser cache. |
