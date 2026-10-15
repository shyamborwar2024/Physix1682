/* ===== Theme Management ===== */
const ThemeManager = (function() {
    const THEME_KEY = 'epa-theme';
    const themes = ['light', 'dark', 'system'];
    let currentTheme = 'system';
    let systemListener = null;

    function init() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved && themes.includes(saved)) {
            currentTheme = saved;
        }
        applyTheme(currentTheme);
        createThemeToggle();
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        currentTheme = theme;
        updateToggleIcon();
        setupSystemListener(theme === 'system');
    }

    function setupSystemListener(enable) {
        if (systemListener) {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemListener);
            systemListener = null;
        }
        if (enable) {
            systemListener = (e) => {
                if (currentTheme === 'system') {
                    applyTheme('system');
                }
            };
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', systemListener);
        }
    }

    function getNextTheme() {
        const idx = themes.indexOf(currentTheme);
        return themes[(idx + 1) % themes.length];
    }

    function toggle() {
        const next = getNextTheme();
        applyTheme(next);
    }

    function createThemeToggle() {
        const existing = document.querySelector('.theme-toggle');
        if (existing) {
            existing.addEventListener('click', toggle);
            return;
        }
    }

    function updateToggleIcon() {
        const toggles = document.querySelectorAll('.theme-toggle');
        const icons = {
            light: '☀️',
            dark: '🌙',
            system: '⚙️'
        };
        toggles.forEach(btn => {
            btn.textContent = icons[currentTheme] || icons.system;
            btn.setAttribute('aria-label', `Switch to ${getNextTheme()} mode`);
        });
    }

    function getTheme() {
        return currentTheme;
    }

    return { init, applyTheme, toggle, getTheme };
})();

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ThemeManager.init);
} else {
    ThemeManager.init();
}