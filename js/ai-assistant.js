/* ===== AI Physics Assistant (Demo Engine) ===== */
const AIAssistant = (function() {
    const assistantScriptUrl = document.currentScript instanceof HTMLScriptElement
        ? document.currentScript.src
        : new URL('js/ai-assistant.js', document.baseURI).href;
    const chatWindow = document.getElementById('ai-chat-window');
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');
    let knowledgeBasePromise;
    let knowledgeBaseLoadError = false;
    const stopWords = new Set([
        'about', 'after', 'also', 'and', 'are', 'can', 'could', 'define', 'describe',
        'does', 'explain', 'for', 'from', 'give', 'help', 'how', 'i', 'in', 'is',
        'it', 'me', 'of', 'on', 'please', 'simple', 'simply', 'solve', 'tell',
        'that', 'the', 'their', 'this', 'to', 'understand', 'use', 'what', 'when',
        'where', 'which', 'who', 'why', 'with', 'would'
    ]);

    const QUICK_ACTIONS = [
        { label: 'Explain Simply', action: 'explain' },
        { label: 'Give Example', action: 'example' },
        { label: 'Solve Numerical', action: 'numerical' },
        { label: 'Exam Answer', action: 'exam' },
        { label: 'Quiz Me', action: 'quiz' },
        { label: 'Revision Notes', action: 'notes' }
    ];

    function init() {
        loadKnowledgeBase();
        if (chatWindow) {
            const quickActions = document.getElementById('ai-quick-actions');
            if (quickActions) {
                quickActions.innerHTML = QUICK_ACTIONS.map(q => `
                    <button class="ai-quick-btn" data-action="${q.action}">${q.label}</button>
                `).join('');
                quickActions.querySelectorAll('.ai-quick-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        sendMessage(getQuickActionPrompt(btn.getAttribute('data-action')));
                    });
                });
            }
            sendBtn?.addEventListener('click', () => sendMessage());
            chatInput?.addEventListener('keydown', event => {
                if (event.key === 'Enter') sendMessage();
            });
            addMessage('Welcome to PHYSX AI. I can search the local 500-question physics FAQ. These draft answers need faculty review; this demo is not a live AI service.', 'bot');
        }
        initFloatingAssistant();
    }

    function getQuickActionPrompt(action) {
        const prompts = {
            'explain': 'Explain a physics concept in simple language.',
            'example': 'Give me a real-world example of a physics concept.',
            'numerical': 'Help me solve a numerical problem step by step.',
            'exam': 'How should I structure my exam answer for maximum marks?',
            'quiz': 'Quiz me on a physics topic.',
            'notes': 'Give me revision notes for a physics chapter.'
        };
        return prompts[action] || action;
    }

    function sendMessage(customPrompt, targetWindow = chatWindow, targetInput = chatInput) {
        const message = customPrompt || (targetInput ? targetInput.value.trim() : '');
        if (!message || !targetWindow) return;

        addMessage(message, 'user', targetWindow);
        if (targetInput) targetInput.value = '';

        setTimeout(async () => {
            const response = await generateResponse(message);
            addMessage(response, 'bot', targetWindow);
        }, 450);
    }

    function addMessage(text, sender, targetWindow = chatWindow) {
        if (!targetWindow) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'ai-bubble';
        bubble.textContent = text;
        msgDiv.appendChild(bubble);
        targetWindow.appendChild(msgDiv);
        targetWindow.scrollTop = targetWindow.scrollHeight;
    }

    function loadKnowledgeBase() {
        if (knowledgeBasePromise) return knowledgeBasePromise;
        knowledgeBaseLoadError = false;
        const knowledgeBaseUrls = [
            new URL('../assets/PhysX_AI_Assistant_500_FAQ_Knowledge_Base.json', assistantScriptUrl),
            new URL('../data/physx-ai-knowledge-base.json', assistantScriptUrl)
        ];
        knowledgeBasePromise = (async () => {
            let lastError;
            for (const url of knowledgeBaseUrls) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Knowledge base request failed: ${response.status} (${url})`);
                    const records = await response.json();
                    if (!Array.isArray(records) || records.length !== 500) {
                        throw new Error(`The PHYSX FAQ dataset must contain exactly 500 entries (${url}).`);
                    }
                    return records.filter(record => record.question && record.answer);
                } catch (error) {
                    lastError = error;
                }
            }
            throw lastError || new Error('No PHYSX FAQ dataset URL is configured.');
        })().catch(error => {
            knowledgeBaseLoadError = true;
            knowledgeBasePromise = null;
            console.error('Could not load the PHYSX FAQ knowledge base.', error);
            return [];
        });
        return knowledgeBasePromise;
    }

    function normalizeFaqText(value) {
        return String(value || '').toLowerCase().normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function getSearchTokens(value) {
        return normalizeFaqText(value).split(/\s+/)
            .filter(token => token.length > 2 && !stopWords.has(token));
    }

    async function findKnowledgeAnswer(message) {
        const records = await loadKnowledgeBase();
        if (knowledgeBaseLoadError) {
            return 'I could not load the local PHYSX FAQ dataset. Please try again later or contact the academy for help.';
        }

        const query = normalizeFaqText(message);
        const queryTokens = [...new Set(getSearchTokens(message))];
        if (!queryTokens.length) return null;

        let bestMatch = null;
        for (const record of records) {
            const question = normalizeFaqText(record.question);
            const related = normalizeFaqText([
                record.category, record.subcategory, record.tags, record.formula
            ].join(' '));
            const answer = normalizeFaqText(record.answer);
            let score = 0;
            let matchedTokens = 0;
            for (const token of queryTokens) {
                if (question.includes(token)) {
                    score += 4;
                    matchedTokens += 1;
                } else if (related.includes(token)) {
                    score += 2;
                    matchedTokens += 1;
                } else if (answer.includes(token)) {
                    score += 0.5;
                    matchedTokens += 1;
                }
            }
            if (query.length > 5 && question.includes(query)) score += 8;
            score += matchedTokens / queryTokens.length;
            if (!bestMatch || score > bestMatch.score) bestMatch = { record, score, matchedTokens };
        }

        if (!bestMatch || bestMatch.score < 3.5 || bestMatch.matchedTokens / queryTokens.length < 0.35) return null;
        const { record } = bestMatch;
        const details = [];
        if (record.formula) details.push(`Key terms/formula: ${record.formula}`);
        if (record.solution && record.solution !== record.answer) details.push(`Steps: ${record.solution}`);
        details.push(`Source: PHYSX FAQ ${record.id} · ${record.category}`);
        return `${record.answer} ${details.join(' | ')}`;
    }

    async function generateResponse(message) {
        const lower = message.toLowerCase();
        if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(lower)) {
            return 'Hello! I can search the 500-question Engineering Physics FAQ, help with study methods, or answer basic questions about courses, fees, class timing, and academy contact.';
        }
        if (/\b(who are you|what can you do|what can i ask)\b/.test(lower)) {
            return 'I am PHYSX AI, a local FAQ search demo. Ask about units, mechanics, waves, optics, electromagnetism, semiconductors, modern physics, exam preparation, course fees, or class timing. The FAQ answers are draft study aids that need faculty review.';
        }
        if (/\b(fee|fees|price|pricing|cost|enrol|enroll|registration)\b/.test(lower)) {
            return `The current demo offers Semester 1 and Semester 2 at ₹${ACADEMY_CONFIG.offerSemesterPrice.toLocaleString('en-IN')} each, or the Full First Year at ₹${ACADEMY_CONFIG.fullYearOfferPrice.toLocaleString('en-IN')}. Payment is manual UPI. Share your transaction details on WhatsApp at ${ACADEMY_CONFIG.whatsappNumber} for manual verification and confirmation; this site does not verify payments automatically.`;
        }
        if (/\b(email|contact|whatsapp|phone number|talk to|speak to)\b/.test(lower)) {
            return `You can reach the academy at ${ACADEMY_CONFIG.email} or use the WhatsApp inquiry link in this chat to send a prefilled support message.`;
        }
        if (/\b(class schedule|class timing|live classes|when are classes)\b/.test(lower)) {
            return `The displayed live-class schedule is ${ACADEMY_CONFIG.classDays.join(', ')}, ${ACADEMY_CONFIG.classStart}–${ACADEMY_CONFIG.classEnd} IST. Confirm current class availability with the academy.`;
        }
        if (/\b(up(i|i id)|payment|pay|qr code)\b/.test(lower)) {
            return `Yes. The payment page displays the supplied UPI ID (${ACADEMY_CONFIG.upiId}) and QR for a manual payment flow. Share your transaction details with the academy on WhatsApp at ${ACADEMY_CONFIG.whatsappNumber} for manual verification and confirmation. This static website does not process or verify payments automatically.`;
        }
        const knowledgeAnswer = await findKnowledgeAnswer(message);
        if (knowledgeAnswer) return knowledgeAnswer;
        if (lower.includes('numerical') || lower.includes('solve') || lower.includes('calculate')) {
            return 'For a numerical, list the known values with units, identify what is required, choose the governing equation, show substitution, and check the final units. This demo cannot verify a specific calculation.';
        }
        if (lower.includes('exam') || lower.includes('answer') || lower.includes('marks')) {
            return 'A clear exam response usually includes the definition or principle, a labelled diagram when useful, the relevant equation, ordered working, and a final answer with units. Check your university marking scheme for exact expectations.';
        }
        if (lower.includes('example')) {
            return 'Example: when a moving car brakes, a passenger tends to keep moving forward until the seat belt exerts a force. This illustrates inertia (Newton’s first law). It is a general example, not a topic-specific AI response.';
        }
        if (lower.includes('quiz')) {
            return 'Quick check: if a wave travels at the same speed but its frequency doubles, what happens to its wavelength? Use v = fλ to reason it out. This demo cannot grade a full quiz.';
        }
        return 'I could not find a close match in the local FAQ. Try a physics topic such as SI units, waves, optics, mechanics, semiconductors, or modern physics. Answers are study aids and need faculty review.';
    }

    function initFloatingAssistant() {
        const widget = document.createElement('div');
        widget.className = 'ai-support-widget';
        widget.innerHTML = `
            <section class="ai-support-panel" id="ai-support-panel" role="dialog" aria-label="PHYSX AI support demo" aria-modal="false" hidden>
                <header class="ai-support-header">
                    <span class="ai-support-avatar" aria-hidden="true">✦</span>
                    <span><strong>PHYSX AI</strong><small>500-question physics FAQ · local demo</small></span>
                    <button class="ai-support-close" type="button" aria-label="Close assistant">×</button>
                </header>
                <p class="ai-support-notice">Local 500-question FAQ · draft answers require faculty review. No live AI is connected; don't enter personal information.</p>
                <div class="ai-support-messages" role="log" aria-live="polite" aria-label="Assistant conversation"></div>
                <div class="ai-support-prompts" aria-label="Suggested questions">
                    <button type="button" data-prompt="What are the seven SI base units?">SI base units</button>
                    <button type="button" data-prompt="Explain the photoelectric effect">Photoelectric effect</button>
                    <button type="button" data-prompt="How do I structure a physics exam answer?">Exam tips</button>
                </div>
                <form class="ai-support-form">
                    <label class="sr-only" for="ai-support-input">Ask a sample physics question</label>
                    <input id="ai-support-input" name="question" type="text" maxlength="500" placeholder="Ask a physics question…" autocomplete="off">
                    <button type="submit" aria-label="Send question">Send</button>
                </form>
                <a class="ai-support-contact" href="${window.getWhatsappInquiryUrl('ai-assistant')}" target="_blank" rel="noopener noreferrer">Ask the academy on WhatsApp ↗</a>
            </section>
            <button class="ai-support-launcher" type="button" aria-label="Open PHYSX AI assistant" aria-expanded="false" aria-controls="ai-support-panel">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                    <defs><linearGradient id="ai-orbit-gradient" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#a9f4ff"/><stop offset="1" stop-color="#d7c0ff"/></linearGradient></defs>
                    <ellipse cx="32" cy="32" rx="25" ry="11" fill="none" stroke="url(#ai-orbit-gradient)" stroke-width="2.3" transform="rotate(-34 32 32)"/>
                    <ellipse cx="32" cy="32" rx="25" ry="11" fill="none" stroke="#8eeaff" stroke-opacity=".76" stroke-width="1.7" transform="rotate(34 32 32)"/>
                    <circle cx="32" cy="32" r="7" fill="#fff"/>
                    <path d="M48 10v8m-4-4h8M14 42v6m-3-3h6" stroke="#fff" stroke-linecap="round" stroke-width="2.4"/>
                </svg>
                <span class="sr-only">Open physics assistant</span>
            </button>`;
        document.body.appendChild(widget);

        const panel = widget.querySelector('.ai-support-panel');
        const launcher = widget.querySelector('.ai-support-launcher');
        const closeButton = widget.querySelector('.ai-support-close');
        const messages = widget.querySelector('.ai-support-messages');
        const input = widget.querySelector('.ai-support-form input');
        const form = widget.querySelector('.ai-support-form');
        const setOpen = open => {
            panel.hidden = !open;
            launcher.setAttribute('aria-expanded', String(open));
            launcher.setAttribute('aria-label', open ? 'Close PHYSX AI assistant' : 'Open PHYSX AI assistant');
            if (open) input.focus();
            else launcher.focus();
        };

        addMessage('Hi! I can search the 500-question physics FAQ or help with course and schedule questions. These draft answers need faculty review.', 'bot', messages);
        launcher.addEventListener('click', () => setOpen(panel.hidden));
        closeButton.addEventListener('click', () => setOpen(false));
        form.addEventListener('submit', event => {
            event.preventDefault();
            sendMessage('', messages, input);
        });
        widget.querySelectorAll('[data-prompt]').forEach(button => {
            button.addEventListener('click', () => sendMessage(button.dataset.prompt, messages, input));
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !panel.hidden) setOpen(false);
        });
    }

    return { init, sendMessage };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AIAssistant.init);
} else {
    AIAssistant.init();
}