/* Shared navigation, footer and client-side demo integrations. */
(function() {
    const description = document.querySelector('meta[name="description"]')?.content
        || 'Engineering Physics learning made visual and practical.';
    const pageTitle = document.title || 'PHYSX ENGINEER | Engineering Physics Academy';
    const canonicalPath = location.pathname.split('/').pop() || 'index.html';
    const canonicalUrl = `https://your-domain.com/${canonicalPath === 'index.html' ? '' : canonicalPath}`;
    function ensureMeta(attribute, name, content) {
        let meta = document.head.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        if (!meta.content) meta.content = content;
    }
    ensureMeta('property', 'og:title', pageTitle);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('name', 'twitter:card', 'summary');
    ensureMeta('name', 'twitter:title', pageTitle);
    ensureMeta('name', 'twitter:description', description);
    if (!document.querySelector('link[rel="canonical"]')) {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = canonicalUrl;
        document.head.appendChild(canonical);
    }
    if (!document.querySelector('script[type="application/ld+json"]')) {
        const structuredData = document.createElement('script');
        structuredData.type = 'application/ld+json';
        structuredData.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: ACADEMY_CONFIG.brandName,
            url: 'https://your-domain.com/',
            description
        });
        document.head.appendChild(structuredData);
    }

    const stylesheets = [
        'css/themes.css',
        'css/style.css',
        'css/responsive.css',
        'css/animations.css',
        'css/site.css'
    ];
    stylesheets.forEach(href => {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    });
    const threeScript = document.querySelector('script[src*="three.min.js"]');
    threeScript?.addEventListener('load', () => {
        window.dispatchEvent(new Event('physx:three-ready'));
    }, { once: true });

    const navigation = [
        ['Home', 'index.html'],
        ['Courses', 'courses.html'],
        ['Syllabus', 'syllabus.html'],
        ['Classes', 'classes.html'],
        ['Physics lab', 'physics-lab.html'],
        ['Study material', 'study-material.html'],
        ['Tests', 'tests.html'],
        ['Free demo', 'demo.html'],
        ['Faculty', 'faculty.html']
    ];
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const whatsappInquiryMessages = {
        general: 'Hello Engineering Physics Academy, I would like to ask a general question about your courses and services.',
        faculty: 'Hello, I would like to enquire about Dr. Shyam Borwar, his teaching experience, and physics or research guidance.',
        semester1: 'Hello, I would like details about the Engineering Physics Semester 1 course, syllabus, class schedule, and fees.',
        semester2: 'Hello, I would like details about the Engineering Physics Semester 2 course, syllabus, class schedule, and fees.',
        'full-year': 'Hello, I would like details about the Full First Year Engineering Physics course, included semesters, class schedule, and fees.',
        thesis: 'Hello, I would like to enquire about thesis and dissertation mentoring, including topic selection, research methodology, formatting, and viva preparation.',
        'research-publication': 'Hello, I would like to enquire about research paper and publication support, including manuscript editing, journal formatting, and reviewer responses.',
        'student-academic-support': 'Hello, I would like to enquire about student academic support, Engineering Physics coaching, notes, numericals, practical guidance, and exam preparation.',
        'project-innovation': 'Hello, I would like to enquire about project and innovation mentoring, prototype planning, research proposals, and intellectual-property awareness.',
        'ai-assistant': 'Hello, I have a question about PHYSX AI learning support and the physics knowledge base.',
        payment: 'Hello, I have made a course payment. Here are my transaction details for manual verification and confirmation.'
    };
    function getWhatsappInquiryUrl(topic = 'general') {
        const message = whatsappInquiryMessages[topic] || whatsappInquiryMessages.general;
        const configuredNumber = ACADEMY_CONFIG.whatsappNumber.replace(/\D/g, '');
        const internationalNumber = configuredNumber.length === 10 ? `91${configuredNumber}` : configuredNumber;
        return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
    }
    window.getWhatsappInquiryUrl = getWhatsappInquiryUrl;
    const navLinks = navigation.map(([label, href]) =>
        `<a href="${href}"${currentPage === href ? ' aria-current="page"' : ''}>${label}</a>`
    ).join('');
    const serviceItems = [
        ['Overview', 'services.html'],
        ['Thesis & dissertation', 'services.html#thesis'],
        ['Research publication', 'services.html#publication'],
        ['Student academic support', 'services.html#academic-support'],
        ['Projects & innovation', 'services.html#projects']
    ];
    const serviceMenuItems = serviceItems.map(([label, href]) =>
        `<a href="${href}">${label}</a>`
    ).join('');
    const serviceDropdown = `<details class="nav-dropdown${currentPage === 'services.html' ? ' is-current' : ''}"><summary>Our Services <span aria-hidden="true">⌄</span></summary><div class="nav-dropdown-menu">${serviceMenuItems}</div></details>`;
    const mobileServiceDropdown = `<details class="mobile-nav-dropdown"${currentPage === 'services.html' ? ' open' : ''}><summary>Our Services</summary><div>${serviceMenuItems}</div></details>`;

    document.querySelector('.header')?.remove();
    document.querySelector('.mobile-menu')?.remove();
    document.querySelector('.footer')?.remove();
    if (!document.querySelector('#main-content')) {
        const firstContent = document.body.querySelector('section, main');
        if (firstContent) firstContent.id = 'main-content';
    }

    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
        <a class="skip-link" href="#main-content">Skip to content</a>
        <div class="header-inner container">
            <a class="header-logo" href="index.html" aria-label="PHYSX ENGINEER home">PHYSX<span>ENGINEER</span></a>
            <nav class="header-nav" aria-label="Main navigation">${navLinks}${serviceDropdown}<a href="contact.html">Contact</a></nav>
            <div class="header-actions">
                <button class="theme-toggle" type="button" aria-label="Switch to dark mode">⚙️</button>
                <a class="header-login" href="login.html">Log in</a>
                <a class="btn btn-primary btn-sm header-enroll" href="register.html">Enroll</a>
                <button class="hamburger" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-mobile-menu"><span></span><span></span><span></span></button>
            </div>
        </div>`;
    document.body.prepend(header);

    const mobileMenu = document.createElement('nav');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'site-mobile-menu';
    mobileMenu.setAttribute('aria-label', 'Mobile navigation');
    mobileMenu.innerHTML = `${navLinks}${mobileServiceDropdown}<a href="contact.html">Contact</a><a href="login.html">Log in</a><a href="register.html">Enroll now</a>`;
    header.insertAdjacentElement('afterend', mobileMenu);
    function syncServiceNavState() {
        document.querySelectorAll('.nav-dropdown-menu a, .mobile-nav-dropdown a').forEach(link => {
            const destination = new URL(link.href, location.href);
            const isCurrent = destination.pathname === location.pathname && destination.hash === location.hash;
            if (isCurrent) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }
    syncServiceNavState();
    window.addEventListener('hashchange', syncServiceNavState);

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-grid">
            <div class="footer-brand"><a href="index.html">PHYSX ENGINEER</a><p>Engineering Physics made visual, practical and easy.</p><p>Learn · Visualize · Practice · Master</p></div>
            <div class="footer-col"><h2>Explore</h2><a href="courses.html">Courses</a><a href="services.html">Our services</a><a href="syllabus.html">Syllabus</a><a href="classes.html">Live classes</a><a href="physics-lab.html">Physics lab</a><a href="study-material.html">Study material</a><a href="tests.html">Practice tests</a></div>
            <div class="footer-col"><h2>Academy</h2><a href="about.html">About</a><a href="faculty.html">Faculty</a><a href="demo.html">Free demo</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a><a href="dashboard.html">Student dashboard</a></div>
            <div class="footer-col"><h2>Get in touch</h2><a href="mailto:${ACADEMY_CONFIG.email}">${ACADEMY_CONFIG.email}</a><a href="${getWhatsappInquiryUrl()}">WhatsApp support</a><span>${Object.values(ACADEMY_CONFIG.locations).join(' · ')}</span><h2 class="footer-social-heading">Follow us</h2><div id="footer-social-links" class="social-cta footer-social-links" aria-label="Academy social media links"></div><small class="footer-social-note">Demo destinations · replace with official profile links.</small></div>
        </div>
        <div class="footer-bottom"><p>Course materials are for learning support. Always verify the latest official syllabus with your university.</p><div><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="refund-policy.html">Refund policy</a><a href="disclaimer.html">Disclaimer</a></div><span>© ${new Date().getFullYear()} Online Engineering Physics Academy</span></div>`;
    document.body.appendChild(footer);
    function populateSocialLinks(container) {
        if (!container) return;
        const platforms = [
            ['instagram', 'Instagram', '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6.5" r="1.25" fill="currentColor"/>'],
            ['linkedin', 'LinkedIn', '<circle cx="7.3" cy="7.2" r="1.6" fill="currentColor"/><path d="M5.8 10h3v9h-3zm5 0h2.9v1.25c.55-.9 1.5-1.5 2.85-1.5 2.7 0 3.45 1.75 3.45 4.15V19h-3v-4.55c0-1.1-.15-2-1.4-2s-1.8.95-1.8 2V19h-3z" fill="currentColor"/>'],
            ['youtube', 'YouTube', '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6z" fill="currentColor"/>'],
            ['facebook', 'Facebook', '<path d="M13.4 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2V11H7.6v3h2.7v8z" fill="currentColor"/>'],
            ['twitter', 'X / Twitter', '<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.8 5.8 22H2.6l7.3-8.4L2.1 2h6.5l4.4 6.6zm-1.1 17.9h1.7L7.6 4H5.8z" fill="currentColor"/>'],
            ['telegram', 'Telegram', '<path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm5 7.2-1.7 8.1c-.13.58-.48.72-.98.45l-2.72-2-1.31 1.27c-.14.14-.26.26-.53.26l.19-2.77 5.04-4.55c.22-.19-.05-.3-.34-.11L8.4 13.35l-2.7-.84c-.59-.18-.6-.59.12-.88l10.57-4.08c.49-.18.91.12.75 1.15Z" fill="currentColor"/>'],
            ['whatsapp', 'WhatsApp', '<path d="M12 2a9.7 9.7 0 0 0-8.3 14.75L2.4 22l5.4-1.42A9.8 9.8 0 1 0 12 2Zm0 17.7a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-3.2.84.86-3.12-.19-.32A7.8 7.8 0 1 1 12 19.7Zm4.3-5.85c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.31.98 2.47c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.19 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" fill="currentColor"/>']
        ];
        platforms.forEach(([key, label, paths]) => {
            const href = key === 'whatsapp'
                ? getWhatsappInquiryUrl()
                : ACADEMY_CONFIG.socialLinks[key];
            if (!/^https?:\/\//i.test(href)) return;
            const link = document.createElement('a');
            link.className = 'social-btn';
            link.href = href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', label);
            link.title = label;
            const icon = document.createElement('span');
            icon.className = 'social-mark';
            icon.setAttribute('aria-hidden', 'true');
            icon.dataset.platform = key;
            icon.innerHTML = `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">${paths}</svg>`;
            link.append(icon, document.createTextNode(label));
            container.appendChild(link);
        });
    }
    populateSocialLinks(document.getElementById('footer-social-links'));

    const hamburger = header.querySelector('.hamburger');
    const closeMenu = () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation');
    };
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    hamburger.dataset.menuBound = 'true';
    mobileMenu.addEventListener('click', event => {
        if (event.target instanceof HTMLAnchorElement) closeMenu();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            const email = loginForm.elements.loginEmail.value.trim().toLowerCase();
            const password = loginForm.elements.loginPassword.value;
            if (email !== 'student@example.com' || password !== 'demo123') {
                NotificationManager.show('This static demo accepts the sample credentials shown below. Student account authentication is not connected.', 'warning');
                return;
            }
            localStorage.setItem('epa-demo', 'true');
            DashboardManager.demoLogin();
        });
    }

    document.querySelectorAll('[data-config="email"]').forEach(el => {
        el.textContent = ACADEMY_CONFIG.email;
        if (el instanceof HTMLAnchorElement) el.href = `mailto:${ACADEMY_CONFIG.email}`;
    });
    document.querySelectorAll('[data-config="whatsappNumber"]').forEach(el => {
        el.textContent = ACADEMY_CONFIG.whatsappNumber;
        if (el instanceof HTMLAnchorElement) el.href = `https://wa.me/${ACADEMY_CONFIG.whatsappNumber}`;
    });
    document.querySelectorAll('[data-whatsapp-inquiry]').forEach(element => {
        if (!(element instanceof HTMLAnchorElement)) return;
        element.href = getWhatsappInquiryUrl(element.dataset.whatsappInquiry);
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
    });
    function formatClockTime(value) {
        const [hourValue, minute] = value.split(':').map(Number);
        const hour = hourValue % 12 || 12;
        return `${hour}:${String(minute).padStart(2, '0')} ${hourValue >= 12 ? 'PM' : 'AM'}`;
    }
    document.querySelectorAll('[data-config="classTime"]').forEach(el => {
        el.textContent = `${formatClockTime(ACADEMY_CONFIG.classStart)}–${formatClockTime(ACADEMY_CONFIG.classEnd)} IST`;
    });
    document.querySelectorAll('[data-config="classDays"]').forEach(el => {
        el.textContent = ACADEMY_CONFIG.classDays.join('–');
    });
    document.querySelectorAll('[data-config="classStart"]').forEach(el => {
        el.textContent = ACADEMY_CONFIG.classStart;
    });
    document.querySelectorAll('[data-config="locations"]').forEach(el => {
        el.textContent = Object.values(ACADEMY_CONFIG.locations).join(' · ');
    });
    document.querySelectorAll('[data-location]').forEach(el => {
        const location = ACADEMY_CONFIG.locations[el.dataset.location];
        if (location) el.textContent = location;
    });
    const scheduleBody = document.getElementById('class-schedule-body');
    if (scheduleBody) {
        [...ACADEMY_CONFIG.classDays, ...ACADEMY_CONFIG.holidays].forEach(day => {
            const hasClass = ACADEMY_CONFIG.classDays.includes(day);
            const row = document.createElement('tr');
            const dayCell = document.createElement('td');
            const timeCell = document.createElement('td');
            const topicCell = document.createElement('td');
            dayCell.className = 'schedule-day';
            timeCell.className = 'schedule-time';
            dayCell.textContent = day;
            timeCell.textContent = hasClass
                ? `${formatClockTime(ACADEMY_CONFIG.classStart)}–${formatClockTime(ACADEMY_CONFIG.classEnd)} IST`
                : 'Holiday';
            topicCell.textContent = hasClass ? 'Engineering Physics · topic to be announced' : '—';
            row.append(dayCell, timeCell, topicCell);
            scheduleBody.appendChild(row);
        });
    }
    const socialLinks = document.getElementById('social-links');
    const socialEmpty = document.getElementById('social-empty');
    if (socialLinks) {
        populateSocialLinks(socialLinks);
        if (socialLinks.childElementCount && socialEmpty) socialEmpty.hidden = true;
    }
    const prices = {
        semesterRegular: ACADEMY_CONFIG.regularSemesterPrice,
        semesterOffer: ACADEMY_CONFIG.offerSemesterPrice,
        semesterSaving: ACADEMY_CONFIG.regularSemesterPrice - ACADEMY_CONFIG.offerSemesterPrice,
        fullYearRegular: ACADEMY_CONFIG.fullYearRegularPrice,
        fullYearOffer: ACADEMY_CONFIG.fullYearOfferPrice,
        fullYearSaving: ACADEMY_CONFIG.fullYearRegularPrice - ACADEMY_CONFIG.fullYearOfferPrice,
        discount: Math.round((1 - ACADEMY_CONFIG.offerSemesterPrice / ACADEMY_CONFIG.regularSemesterPrice) * 100)
    };
    document.querySelectorAll('[data-price]').forEach(element => {
        const amount = prices[element.dataset.price];
        if (amount !== undefined) {
            element.textContent = element.dataset.price === 'discount'
                ? `${amount}%`
                : `₹${amount.toLocaleString('en-IN')}`;
        }
    });

    document.querySelectorAll('.faq-question').forEach(question => {
        question.setAttribute('aria-expanded', 'false');
        const nativeButton = question instanceof HTMLButtonElement;
        if (!nativeButton) {
            question.setAttribute('role', 'button');
            question.setAttribute('tabindex', '0');
        }
        const toggle = () => {
            const item = question.closest('.faq-item');
            const expanded = item.classList.toggle('open');
            question.setAttribute('aria-expanded', String(expanded));
        };
        question.addEventListener('click', toggle);
        if (!nativeButton) {
            question.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                }
            });
        }
    });

    if (!['register.html', 'payment.html', 'payment-confirmation.html'].includes(currentPage)) {
        const sticky = document.createElement('a');
        sticky.className = 'sticky-cta';
        sticky.href = 'register.html';
        const offer = ACADEMY_CONFIG.offerSemesterPrice.toLocaleString('en-IN');
        sticky.innerHTML = `<span><strong>₹${offer}</strong><small> per semester</small></span><b>Enroll now</b>`;
        sticky.setAttribute('aria-label', `Enroll for ₹${offer} per semester`);
        document.body.appendChild(sticky);
        window.addEventListener('scroll', () => sticky.classList.toggle('visible', window.scrollY > 420), { passive: true });
    }

    const scripts = [
        'js/main.js',
        'js/galaxy-hero.js',
        'js/theme.js',
        'js/clock.js',
        'js/schedule.js',
        'js/registration.js',
        'js/payment.js',
        'js/syllabus.js',
        'js/tests.js',
        'js/results.js',
        'js/student-tools.js',
        'js/physics3d.js',
        'js/home-lab-showcase.js',
        'js/ai-assistant.js',
        'js/dashboard.js',
        'js/admin.js'
    ];
    scripts.reduce((chain, src) => chain.then(() => new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
            console.error(`Could not load ${src}`);
            resolve();
        };
        document.body.appendChild(script);
    })), Promise.resolve());
})();
