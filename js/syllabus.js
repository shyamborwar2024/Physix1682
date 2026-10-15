/* ===== Syllabus Data & Display Logic ===== */
const SyllabusManager = (function() {
    const DEMO_SYLLABUS = {
        "SPPU": {
            "Engineering Physics": {
                1: {
                    units: [
                        {
                            name: "Unit 1: Mechanics",
                            chapters: [
                                { name: "Newton's Laws of Motion", topics: ["First Law", "Second Law", "Third Law", "Free Body Diagrams"] },
                                { name: "Kinematics", topics: ["Projectile Motion", "Circular Motion", "Relative Velocity"] },
                                { name: "Work, Energy & Power", topics: ["Work-Energy Theorem", "Conservation of Energy"] },
                                { name: "Rotational Motion", topics: ["Moment of Inertia", "Angular Momentum", "Torque"] }
                            ]
                        },
                        {
                            name: "Unit 2: Waves & Oscillations",
                            chapters: [
                                { name: "Simple Harmonic Motion", topics: ["SHM Equation", "Energy in SHM", "Phase"] },
                                { name: "Wave Motion", topics: ["Wave Equation", "Wave Speed", "Superposition"] },
                                { name: "Interference", topics: ["Young's Double Slit", "Thin Films"] },
                                { name: "Standing Waves", topics: ["String Waves", "Organ Pipes"] }
                            ]
                        }
                    ]
                }
            }
        }
    };

    function getChapters(university, subject, semester) {
        const uniData = DEMO_SYLLABUS[university];
        if (!uniData) return null;
        const subjData = uniData[subject];
        if (!subjData) return null;
        return subjData[semester] || null;
    }

    function renderChapters(containerId, university, subject, semester) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = getChapters(university, subject, semester);
        if (!data) {
            container.innerHTML = '<p class="empty-state">Syllabus data not available. Please select a different combination.</p>';
            return;
        }

        container.innerHTML = data.units.map(unit => `
            <div class="unit-card">
                <h3>${unit.name}</h3>
                <div class="chapters-list">
                    ${unit.chapters.map(ch => `
                        <div class="chapter-card">
                            <h4>${ch.name}</h4>
                            <div class="topics">
                                ${ch.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    return { getChapters, renderChapters };
})();