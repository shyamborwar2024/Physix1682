/* ===== Main Application Logic ===== */

// ===== Scroll Header Effect =====
const HeaderManager = (function() {
    let header = document.querySelector('.header');
    let lastScroll = 0;
    const threshold = 50;

    function init() {
        if (!header) return;
        window.addEventListener('scroll', () => {
            const current = window.pageYOffset;
            if (current > threshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = current;
        });
    }
    return { init };
})();

// ===== Mobile Menu =====
const MobileMenu = (function() {
    let hamburger = document.querySelector('.hamburger');
    let menu = document.querySelector('.mobile-menu');

    function init() {
        if (!hamburger || hamburger.dataset.menuBound === 'true') return;
        hamburger.addEventListener('click', toggle);
        menu.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('click', closeMenuOutside);
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) closeMenu();
        });
    }

    function toggle() {
        hamburger.classList.toggle('active');
        menu.classList.toggle('open');
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        menu.classList.remove('open');
    }

    function closeMenuOutside(e) {
        if (menu && menu.classList.contains('open') &&
            !menu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMenu();
        }
    }
    return { init };
})();

// ===== Scroll Reveal Animation =====
const ScrollReveal = (function() {
    let observer = null;

    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
    return { init };
})();

// ===== Number Counter Animation =====
const NumberCounter = (function() {
    let observer = null;

    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.counter[data-to]').forEach(el => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseFloat(el.getAttribute('data-to'));
        const duration = 2000;
        const start = performance.now();
        const initial = 0;

        function easeOutQuad(t) {
            return t * (2 - t);
        }

        function tick(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = initial + (target - initial) * easeOutQuad(progress);
            el.textContent = Math.floor(value).toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = Math.floor(target).toLocaleString();
            }
        }
        requestAnimationFrame(tick);
    }
    return { init };
})();

// ===== Sticky CTA =====
const StickyCTA = (function() {
    let cta = null;
    const showAfter = 400;
    const hidePages = ['payment', 'payment-confirmation', 'register', 'contact'];

    function init() {
        const path = window.location.pathname;
        if (hidePages.some(p => path.includes(p))) return;

        cta = document.querySelector('.sticky-cta');
        if (!cta) {
            cta = document.createElement('a');
            cta.href = 'register.html';
            cta.className = 'sticky-cta';
            const offer = ACADEMY_CONFIG.offerSemesterPrice.toLocaleString('en-IN');
            cta.innerHTML = `₹${offer} <span class="price-off">Enroll now</span>`;
            cta.setAttribute('aria-label', `Enroll now for ₹${offer}`);
            document.body.appendChild(cta);
        }

        window.addEventListener('scroll', checkVisibility);
        checkVisibility();
    }

    function checkVisibility() {
        if (cta && window.pageYOffset > showAfter) {
            cta.classList.add('visible');
        } else {
            cta.classList.remove('visible');
        }
    }
    return { init };
})();

// ===== WhatsApp Helper =====
function openWhatsApp(message) {
    const configuredNumber = (ACADEMY_CONFIG.whatsappNumber || '7030336540').replace(/\D/g, '');
    const number = configuredNumber.length === 10 ? `91${configuredNumber}` : configuredNumber;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ===== Notification System =====
const NotificationManager = (function() {
    let container = null;
    let timeout = null;

    function init() {
        if (document.querySelector('.notification')) return;

        container = document.createElement('div');
        container.className = 'notification';
        container.setAttribute('role', 'alert');
        document.body.appendChild(container);
    }

    function show(message, type = 'info') {
        if (!container) init();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '🔔'
        };
        container.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
        container.classList.add(type);
        container.classList.add('show');

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            container.classList.remove('show');
        }, 5000);
    }

    function hide() {
        container.classList.remove('show');
    }
    return { show, hide };
})();

// ===== Form Validation Helper =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}

function validateUPi(upi) {
    return /\S+@\S+/.test(upi);
}

// ===== Smooth Scroll for Anchor Links =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== Initialize All =====
function initMainApplication() {
    HeaderManager.init();
    MobileMenu.init();
    ScrollReveal.init();
    NumberCounter.init();
    StickyCTA.init();
    initSmoothScroll();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApplication, { once: true });
} else {
    initMainApplication();
}

// ===== Lazy Image Loading (progressive enhancement) =====
if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.src = img.dataset.src || img.src;
    });
} else {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                observer.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}