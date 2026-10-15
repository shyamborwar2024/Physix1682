/* ===== Student Dashboard Logic ===== */
const DashboardManager = (function() {
    function init() {
        loadStudentData();
        renderStats();
        updateClassStatus();
        loadProgress();
        setupNavigationCards();
    }

    function loadStudentData() {
        // Demo login handling
        let reg = JSON.parse(localStorage.getItem('epa-current-reg') || '{}');
        if (!reg.id && localStorage.getItem('epa-demo')) {
            const demoData = {
                id: 'EPA-2026-00001',
                name: 'Demo Student',
                mobile: '9999999999',
                email: 'student@example.com',
                university: 'SPPU',
                branch: 'Computer Engineering',
                course: 'Engineering Physics – Semester 1'
            };
            localStorage.setItem('epa-current-reg', JSON.stringify(demoData));
            reg = demoData;
        }
        if (reg.id) {
            document.querySelectorAll('[data-student="name"]').forEach(el => el.textContent = reg.name);
            document.querySelectorAll('[data-student="reg-id"]').forEach(el => el.textContent = reg.id);
        }
    }

    function renderStats() {
        const results = JSON.parse(localStorage.getItem('epa-results') || '[]');
        const scoreTotal = results.reduce((total, result) => total + result.score, 0);
        const stats = [
            { label: 'Course Completion', value: '0%', progress: 0, icon: '📚' },
            { label: 'Tests Attempted', value: String(results.length), progress: Math.min(results.length * 10, 100), icon: '📝' },
            { label: 'Average Score', value: results.length ? `${Math.round(scoreTotal / results.length)}%` : '—', progress: results.length ? scoreTotal / results.length : 0, icon: '📊' },
            { label: 'Chapters Completed', value: '0', progress: 0, icon: '🎯' }
        ];
        const container = document.getElementById('stats-grid');
        if (!container) return;

        container.innerHTML = stats.map(s => `
            <div class="dash-card">
                <div class="dash-card-icon">${s.icon}</div>
                <h3>${s.label}</h3>
                <p class="counter" data-to="${parseFloat(s.value)}">${s.value}</p>
                <div class="dash-progress"><div class="dash-progress-bar" style="width: ${s.progress}%"></div></div>
            </div>
        `).join('');
    }

    function updateClassStatus() {
        const statusEl = document.getElementById('dashboard-live-status');
        if (!statusEl) return;

        const now = ClockManager.getIstParts(new Date());
        const dayName = now.weekday;
        const minuteOfDay = now.hour * 60 + now.minute;
        const [startHour, startMinute] = ACADEMY_CONFIG.classStart.split(':').map(Number);
        const [endHour, endMinute] = ACADEMY_CONFIG.classEnd.split(':').map(Number);
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        if (ACADEMY_CONFIG.holidays.includes(dayName)) {
            statusEl.textContent = 'Weekend holiday · Next weekday class schedule resumes Monday.';
            return;
        }

        if (minuteOfDay < start) {
            statusEl.textContent = `Next class · Today at ${ACADEMY_CONFIG.classStart} IST.`;
        } else if (minuteOfDay < end) {
            statusEl.textContent = 'Live class time · Use the academy-provided meeting link when available.';
        } else {
            statusEl.textContent = `Today's scheduled class time has passed · Next class on the next weekday at ${ACADEMY_CONFIG.classStart} IST.`;
        }
    }

    function loadProgress() {
        const results = localStorage.getItem('epa-last-result');
        const resultEl = document.getElementById('latest-result');
        if (resultEl && results) {
            const r = JSON.parse(results);
            resultEl.innerHTML = `Latest: ${r.score}% (${r.correct}/${r.total}) - ${new Date(r.date).toLocaleDateString()}`;
        }
    }

    function setupNavigationCards() {
        const cards = document.querySelectorAll('.nav-card');
        cards.forEach(card => {
            const link = card.getAttribute('data-link');
            if (link) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    if (link && link !== '#') window.location.href = link;
                });
            }
        });
    }

    function demoLogin() {
        const demoData = {
            id: 'EPA-2026-00001',
            name: 'Demo Student',
            mobile: '9999999999',
            email: 'student@example.com',
            university: 'SPPU',
            branch: 'Computer Engineering',
            year: 'First Year',
            course: 'Engineering Physics – Semester 1'
        };
        localStorage.setItem('epa-current-reg', JSON.stringify(demoData));
        localStorage.setItem('epa-demo', 'true');
        NotificationManager.show('Demo login successful! This is a demo account.', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    return { init, demoLogin };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DashboardManager.init);
} else {
    DashboardManager.init();
}