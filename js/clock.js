/* Indian Standard Time clock and weekday class status. */
const ClockManager = (function() {
    let clockElement = null;
    let dateElement = null;
    let statusElement = null;
    let interval = null;

    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: ACADEMY_CONFIG.timezone, hour: '2-digit', minute: '2-digit',
        second: '2-digit', hour12: true
    });
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: ACADEMY_CONFIG.timezone, weekday: 'long', day: 'numeric',
        month: 'long', year: 'numeric'
    });
    const partsFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ACADEMY_CONFIG.timezone, weekday: 'long', year: 'numeric',
        month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
        second: 'numeric', hour12: false
    });

    function getIstParts(date) {
        const parts = Object.fromEntries(partsFormatter.formatToParts(date).map(part => [part.type, part.value]));
        return {
            year: Number(parts.year),
            month: Number(parts.month) - 1,
            day: Number(parts.day),
            hour: Number(parts.hour) % 24,
            minute: Number(parts.minute),
            second: Number(parts.second),
            weekday: parts.weekday
        };
    }

    function updateTime() {
        const now = new Date();
        if (clockElement) clockElement.textContent = timeFormatter.format(now);
        if (dateElement) dateElement.textContent = dateFormatter.format(now);
        if (statusElement) renderLiveStatus(now);
    }

    function renderLiveStatus(now) {
        const current = getIstParts(now);
        const minuteOfDay = current.hour * 60 + current.minute;
        const [startHour, startMinute] = ACADEMY_CONFIG.classStart.split(':').map(Number);
        const [endHour, endMinute] = ACADEMY_CONFIG.classEnd.split(':').map(Number);
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayNames.indexOf(current.weekday);
        const hasClassToday = ACADEMY_CONFIG.classDays.includes(current.weekday);
        const isLive = hasClassToday && minuteOfDay >= start && minuteOfDay < end;

        statusElement.className = `live-status ${isLive ? 'live' : ''}`;
        if (isLive) {
            statusElement.textContent = `LIVE CLASS NOW · Today, ${ACADEMY_CONFIG.classStart}–${ACADEMY_CONFIG.classEnd} IST`;
            if (ACADEMY_CONFIG.liveClassLink && ACADEMY_CONFIG.liveClassLink !== '#') {
                const link = document.createElement('a');
                link.href = ACADEMY_CONFIG.liveClassLink;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'live-join-link';
                link.textContent = 'Join class';
                statusElement.append(' ', link);
            } else {
                statusElement.append(' · Join link will be shared by the academy.');
            }
            const dot = document.createElement('span');
            dot.className = 'status-dot';
            statusElement.prepend(dot);
            return;
        }

        let daysAhead = 0;
        let nextClassDay = currentDay;
        const isBeforeClass = hasClassToday && minuteOfDay < start;
        if (!isBeforeClass) {
            do {
                daysAhead += 1;
                nextClassDay = (currentDay + daysAhead) % 7;
            } while (!ACADEMY_CONFIG.classDays.includes(dayNames[nextClassDay]));
        }

        const nextClass = new Date(Date.UTC(
            current.year, current.month, current.day + daysAhead,
            startHour, startMinute, 0
        ));
        const secondsRemaining = Math.max(0, Math.floor((nextClass.getTime() - Date.UTC(
            current.year, current.month, current.day, current.hour, current.minute, current.second
        )) / 1000));
        const hours = Math.floor(secondsRemaining / 3600);
        const minutes = Math.floor((secondsRemaining % 3600) / 60);
        const seconds = secondsRemaining % 60;
        const dayLabel = daysAhead === 0 ? 'Today' : daysAhead === 1 ? 'Tomorrow' : dayNames[nextClassDay];
        const message = ACADEMY_CONFIG.holidays.includes(current.weekday)
            ? `WEEKEND HOLIDAY · Next class ${dayLabel} at ${ACADEMY_CONFIG.classStart} IST`
            : minuteOfDay >= end && hasClassToday
                ? `TODAY'S CLASS COMPLETED · Next class ${dayLabel} at ${ACADEMY_CONFIG.classStart} IST`
                : `NEXT CLASS ${dayLabel.toUpperCase()} · ${ACADEMY_CONFIG.classStart} IST · Starts in ${hours}h ${minutes}m ${seconds}s`;
        statusElement.textContent = message;
        const dot = document.createElement('span');
        dot.className = 'status-dot';
        statusElement.prepend(dot);
    }

    function init(config = {}) {
        clockElement = document.getElementById(config.clockElement || 'ist-clock');
        dateElement = document.getElementById(config.dateElement || 'ist-date');
        statusElement = document.getElementById(config.statusElement || 'live-class-status');
        if (interval) clearInterval(interval);
        updateTime();
        interval = window.setInterval(updateTime, 1000);
    }

    return { init, updateTime, getIstParts };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.ist-clock') || document.getElementById('live-class-status')) {
            ClockManager.init();
        }
    });
} else if (document.querySelector('.ist-clock') || document.getElementById('live-class-status')) {
    ClockManager.init();
}
