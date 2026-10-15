/* Local demo quiz engine. Test results are stored only in this browser. */
const TestManager = (function() {
    const DEMO_QUESTIONS = {
        semester1: [
            { question: "What is the SI unit of Planck's constant?", options: ["Joule", "Joule-second", "Watt", "Electron-volt"], correct: 1, topic: "Quantum Physics" },
            { question: "The photoelectric effect demonstrates which nature of light?", options: ["Wave", "Particle", "Both", "Neither"], correct: 1, topic: "Quantum Physics" },
            { question: "In simple harmonic motion, total energy is proportional to:", options: ["Amplitude", "Square of amplitude", "Frequency", "Phase"], correct: 1, topic: "Waves & Oscillations" },
            { question: "Which experiment demonstrates the wave nature of electrons?", options: ["Photoelectric effect", "Compton scattering", "Davisson–Germer experiment", "Pair production"], correct: 2, topic: "Quantum Physics" },
            { question: "The de Broglie wavelength of a particle is inversely proportional to its:", options: ["Mass", "Velocity", "Momentum", "Energy"], correct: 2, topic: "Quantum Physics" },
            { question: "For ideal projectile motion, the horizontal acceleration is:", options: ["Zero", "g", "2g", "Dependent on mass"], correct: 0, topic: "Mechanics" },
            { question: "The SI unit of angular momentum is:", options: ["N m", "kg m² s⁻¹", "kg m s⁻¹", "J s⁻²"], correct: 1, topic: "Mechanics" },
            { question: "At resonance in a lightly damped oscillator, the amplitude is:", options: ["At its maximum", "Always zero", "Independent of driving frequency", "Equal to the damping coefficient"], correct: 0, topic: "Waves & Oscillations" },
            { question: "Young's double-slit experiment is evidence for:", options: ["Interference", "Polarization only", "Photoelectric emission", "Nuclear decay"], correct: 0, topic: "Optics" },
            { question: "The dimensions of force are:", options: ["MLT⁻¹", "MLT⁻²", "ML²T⁻²", "M⁰LT⁻²"], correct: 1, topic: "Mechanics" }
        ],
        semester2: [
            { question: "Which law describes the magnetic field due to a current element?", options: ["Biot–Savart law", "Ampère's law", "Faraday's law", "Lenz's law"], correct: 0, topic: "Electromagnetism" },
            { question: "The SI unit of magnetic flux is:", options: ["Weber", "Tesla", "Henry", "Ampere"], correct: 0, topic: "Electromagnetism" },
            { question: "In a series LCR circuit at resonance, the impedance is:", options: ["Maximum", "Minimum", "Zero", "Infinite"], correct: 1, topic: "Electromagnetism" },
            { question: "Total internal reflection occurs when light travels:", options: ["Rarer to denser", "Denser to rarer above the critical angle", "At normal incidence", "Only through a vacuum"], correct: 1, topic: "Optics" },
            { question: "Polarization of light demonstrates that light is a:", options: ["Longitudinal wave", "Transverse wave", "Standing wave", "Mechanical wave"], correct: 1, topic: "Optics" },
            { question: "Faraday's law relates induced emf to the rate of change of:", options: ["Electric charge", "Magnetic flux", "Resistance", "Current density"], correct: 1, topic: "Electromagnetism" },
            { question: "The SI unit of capacitance is:", options: ["Henry", "Farad", "Weber", "Tesla"], correct: 1, topic: "Electromagnetism" },
            { question: "A convex lens has positive focal length under the:", options: ["Cartesian sign convention", "Mirror convention", "No sign convention", "Wave convention"], correct: 0, topic: "Optics" },
            { question: "The energy of a photon is given by:", options: ["mc²", "hf", "½mv²", "qV"], correct: 1, topic: "Modern Physics" },
            { question: "An electromagnetic wave in vacuum has its electric and magnetic fields:", options: ["Parallel", "Perpendicular to each other and propagation", "Always zero", "Longitudinal"], correct: 1, topic: "Electromagnetism" }
        ]
    };

    let currentTest = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let markedForReview = [];
    let testStartTime = 0;
    let remainingSeconds = 600;
    let timer = null;

    function init() {
        const startButton = document.getElementById('start-test');
        if (!startButton) return;
        const requestedType = new URLSearchParams(location.search).get('type');
        const typeSelector = document.getElementById('test-type');
        if (typeSelector && DEMO_QUESTIONS[requestedType]) typeSelector.value = requestedType;
        startButton.addEventListener('click', startTest);
    }

    function startTest() {
        const testType = document.getElementById('test-type')?.value || 'semester1';
        currentTest = DEMO_QUESTIONS[testType] || DEMO_QUESTIONS.semester1;
        currentQuestionIndex = 0;
        userAnswers = new Array(currentTest.length).fill(null);
        markedForReview = new Array(currentTest.length).fill(false);
        remainingSeconds = 600;
        testStartTime = Date.now();
        document.getElementById('test-intro').hidden = true;
        document.getElementById('test-active').hidden = false;
        document.getElementById('test-course-title').textContent = testType === 'semester2' ? 'Semester 2' : 'Semester 1';
        renderQuestion(0);
        updateTimer();
        timer = window.setInterval(() => {
            remainingSeconds -= 1;
            updateTimer();
            if (remainingSeconds <= 0) submitTest();
        }, 1000);
    }

    function updateTimer() {
        const timerElement = document.querySelector('.test-timer');
        if (!timerElement) return;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerElement.classList.toggle('timer-warning', remainingSeconds <= 60);
    }

    function renderQuestion(index) {
        currentQuestionIndex = index;
        const question = currentTest[index];
        const container = document.getElementById('test-container');
        if (!container || !question) return;
        const answeredCount = userAnswers.filter(answer => answer !== null).length;
        const progress = ((index + 1) / currentTest.length) * 100;
        container.innerHTML = `
            <div class="test-header"><div class="test-progress"><div class="progress-bar" style="width:${progress}%"></div></div>
                <div class="test-meta"><span>Question ${index + 1} of ${currentTest.length}</span><span>${answeredCount} answered</span><span class="topic-tag">${question.topic}</span></div></div>
            <article class="question-card"><div class="question-num">QUESTION ${String(index + 1).padStart(2, '0')}</div>
                <h3 class="question-text">${question.question}</h3><div class="options-list">
                    ${question.options.map((option, optionIndex) => `<button type="button" class="option-item ${userAnswers[index] === optionIndex ? 'selected' : ''}" aria-pressed="${userAnswers[index] === optionIndex}" data-index="${optionIndex}"><span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span><span>${option}</span></button>`).join('')}
                </div>
            </article>
            <div class="test-navigation"><button type="button" class="btn btn-outline" id="previous-question" ${index === 0 ? 'disabled' : ''}>← Previous</button>
                <button type="button" class="btn btn-outline review-toggle ${markedForReview[index] ? 'is-marked' : ''}" aria-pressed="${markedForReview[index]}">${markedForReview[index] ? '★ Marked for review' : '☆ Mark for review'}</button>
                <button type="button" class="btn btn-primary" id="next-question">${index === currentTest.length - 1 ? 'Submit test' : 'Next question →'}</button></div>`;
        container.querySelectorAll('.option-item').forEach(button => {
            button.addEventListener('click', () => selectOption(index, Number(button.dataset.index)));
        });
        container.querySelector('#previous-question').addEventListener('click', prevQuestion);
        container.querySelector('.review-toggle').addEventListener('click', () => {
            markedForReview[index] = !markedForReview[index];
            renderQuestion(index);
        });
        container.querySelector('#next-question').addEventListener('click', nextQuestion);
    }

    function selectOption(questionIndex, optionIndex) {
        userAnswers[questionIndex] = optionIndex;
        renderQuestion(questionIndex);
    }

    function nextQuestion() {
        if (currentQuestionIndex < currentTest.length - 1) renderQuestion(currentQuestionIndex + 1);
        else if (window.confirm('Submit your answers and view your results?')) submitTest();
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) renderQuestion(currentQuestionIndex - 1);
    }

    function submitTest() {
        if (!currentTest.length) return;
        if (timer) window.clearInterval(timer);
        timer = null;
        const topicStats = {};
        let correct = 0;
        let wrong = 0;
        currentTest.forEach((question, index) => {
            const answer = userAnswers[index];
            topicStats[question.topic] = topicStats[question.topic] || { correct: 0, total: 0 };
            topicStats[question.topic].total += 1;
            if (answer === null) return;
            if (answer === question.correct) {
                correct += 1;
                topicStats[question.topic].correct += 1;
            } else {
                wrong += 1;
            }
        });
        const result = {
            type: document.getElementById('test-type')?.value || 'semester1',
            total: currentTest.length,
            correct,
            wrong,
            skipped: currentTest.length - correct - wrong,
            score: Math.round((correct / currentTest.length) * 100),
            accuracy: correct + wrong ? Math.round(correct / (correct + wrong) * 100) : 0,
            timeTaken: Math.floor((Date.now() - testStartTime) / 1000),
            topicStats,
            date: new Date().toISOString()
        };
        localStorage.setItem('epa-last-result', JSON.stringify(result));
        const history = JSON.parse(localStorage.getItem('epa-results') || '[]');
        history.unshift(result);
        localStorage.setItem('epa-results', JSON.stringify(history.slice(0, 50)));
        window.location.href = 'results.html';
    }

    return { init, startTest, renderQuestion, selectOption, nextQuestion, prevQuestion, submitTest };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', TestManager.init);
else TestManager.init();
