/* ===== Live Class Scheduler & Syllabus Manager ===== */
const ScheduleManager = (function() {
    function init() {
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const hours = today.getHours();
        const minutes = today.getMinutes();

        // Update live class status badge
        const statusBadge = document.getElementById('class-status-badge');
        if (statusBadge) {
            if (ACADEMY_CONFIG.holidays.includes(dayName)) {
                statusBadge.textContent = 'Holiday';
                statusBadge.className = 'holiday-badge';
            } else if (hours < 20) {
                statusBadge.textContent = 'Upcoming';
                statusBadge.className = 'upcoming-badge';
            } else if (hours < 21) {
                statusBadge.textContent = 'LIVE NOW';
                statusBadge.className = 'live-badge';
            } else {
                statusBadge.textContent = 'Ended';
                statusBadge.className = 'ended-badge';
            }
        }

        // Render today's schedule
        renderTodaySchedule();
    }

    function renderTodaySchedule() {
        const scheduleContainer = document.getElementById('today-schedule');
        if (!scheduleContainer) return;

        const classes = [
            { time: '08:00 PM', topic: 'Mechanics - Newton\'s Laws', room: 'Online' },
            { time: '08:30 PM', topic: 'Numerical Practice Session', room: 'Breakout Rooms' },
            { time: '09:00 PM', topic: 'Q&A / Doubt Clearing', room: 'Main Room' }
        ];

        scheduleContainer.innerHTML = `
            <div class="schedule-header">
                <h3>Today's Schedule</h3>
                <p class="date">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="schedule-items">
                ${classes.map(c => `
                    <div class="schedule-item">
                        <div class="schedule-time">${c.time}</div>
                        <div class="schedule-topic">
                            <strong>${c.topic}</strong>
                            <span class="room-badge">Room: ${c.room}</span>
                        </div>
                        <div class="schedule-actions">
                            <button class="btn btn-sm btn-outline" onclick="joinClass()">Join</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function joinClass() {
        window.open(ACADEMY_CONFIG.liveClassLink, '_blank');
    }

    // Syllabus selector functionality
    function initSyllabusSelector() {
        const selectors = [
            { id: 'university-select', options: ACADEMY_CONFIG.universities },
            { id: 'pattern-select', options: ACADEMY_CONFIG.academicPatterns },
            { id: 'semester-select', options: ACADEMY_CONFIG.semesters },
            { id: 'subject-select', options: ACADEMY_CONFIG.syllabusSubjects },
            { id: 'unit-select', options: ACADEMY_CONFIG.demoSyllabusUnits },
            { id: 'chapter-select', options: ACADEMY_CONFIG.demoSyllabusChapters }
        ];

        selectors.forEach(sel => {
            const element = document.getElementById(sel.id);
            if (element) {
                if (element.options.length <= 1) {
                    sel.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = String(opt);
                        option.textContent = String(opt);
                        element.appendChild(option);
                    });
                }
            }
        });

        // Chain select behavior
        document.getElementById('university-select')?.addEventListener('change', updateSyllabusDisplay);
        document.getElementById('pattern-select')?.addEventListener('change', updateSyllabusDisplay);
        document.getElementById('semester-select')?.addEventListener('change', updateSyllabusDisplay);
        document.getElementById('subject-select')?.addEventListener('change', updateSyllabusDisplay);
        document.getElementById('unit-select')?.addEventListener('change', updateSyllabusDisplay);
        document.getElementById('chapter-select')?.addEventListener('change', updateSyllabusDisplay);
    }

    function updateSyllabusDisplay() {
        const uni = document.getElementById('university-select').value;
        const pattern = document.getElementById('pattern-select').value;
        const sem = document.getElementById('semester-select').value;
        const sub = document.getElementById('subject-select').value;
        const unit = document.getElementById('unit-select').value;
        const chapter = document.getElementById('chapter-select').value;

        const display = document.getElementById('syllabus-display');
        if (!display) return;

        if (uni && pattern && sem && sub && unit && chapter &&
            !uni.startsWith('Select') && !pattern.startsWith('Select') &&
            !sem.startsWith('Select') && !sub.startsWith('Select') &&
            !unit.startsWith('Select') && !chapter.startsWith('Select')) {

            display.innerHTML = `
                <div class="syllabus-preview">
                    <h3>Preview: ${sub} - ${chapter}</h3>
                    <p class="disclaimer">DEMO SYLLABUS - SUBJECT TO REPLACEMENT WITH LATEST OFFICIAL UNIVERSITY SYLLABUS</p>
                    <p>Selected: ${uni} | ${pattern} | Semester ${sem} | ${sub} | ${unit} | ${chapter}</p>
                    <p>Students should verify the latest official syllabus issued by their university.</p>
                </div>
            `;
        } else {
            display.innerHTML = '<p>Please complete all selections to view syllabus preview.</p>';
        }
    }

    return { init, initSyllabusSelector };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ScheduleManager.init();
        ScheduleManager.initSyllabusSelector();
    });
} else {
    ScheduleManager.init();
    ScheduleManager.initSyllabusSelector();
}