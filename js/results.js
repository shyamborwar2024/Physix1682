/* Renders the most recent browser-local demo test result. */
(function() {
    const summary = document.getElementById('results-summary');
    const topics = document.getElementById('results-topics');
    if (!summary || !topics) return;
    const result = JSON.parse(localStorage.getItem('epa-last-result') || 'null');
    if (!result) {
        summary.innerHTML = '<div class="empty-state"><h2>No test result yet</h2><p>Start a practice test to see your score and topic recommendations here.</p><a class="btn btn-primary" href="tests.html">Go to tests</a></div>';
        return;
    }
    const minutes = Math.floor(result.timeTaken / 60);
    const seconds = result.timeTaken % 60;
    const accuracy = result.accuracy ?? (result.correct + result.wrong
        ? Math.round(result.correct / (result.correct + result.wrong) * 100)
        : 0);
    summary.innerHTML = `
        <div class="score-orb" style="--score:${result.score}%"><strong>${result.score}%</strong><span>score</span></div>
        <div class="result-overview"><div class="section-label">DEMO PRACTICE · ${result.type === 'semester2' ? 'SEMESTER 2' : 'SEMESTER 1'}</div><h2>${result.score >= 70 ? 'Good work. Keep building.' : 'A useful place to begin.'}</h2><p>This result is saved only in this browser. It is not an official assessment.</p>
            <div class="result-metrics"><div><strong>${result.correct}</strong><span>Correct</span></div><div><strong>${result.wrong}</strong><span>Incorrect</span></div><div><strong>${result.skipped}</strong><span>Skipped</span></div><div><strong>${accuracy}%</strong><span>Accuracy</span></div><div><strong>${minutes}:${String(seconds).padStart(2, '0')}</strong><span>Time</span></div></div></div>`;
    const weakTopics = Object.entries(result.topicStats || {}).filter(([, value]) => value.correct < value.total);
    const allTopics = Object.entries(result.topicStats || {});
    topics.innerHTML = `<div class="results-topics-heading"><div class="section-label">Next steps</div><h2>Topics to revisit</h2></div>${
        allTopics.length
            ? `<div class="topic-results">${allTopics.map(([name, value]) => `<div class="topic-result"><div><strong>${name}</strong><span>${value.correct} of ${value.total} correct</span></div><div class="topic-progress"><i style="width:${Math.round(value.correct / value.total * 100)}%"></i></div></div>`).join('')}</div><p class="recommendation">${weakTopics.length ? `Spend a little more time on ${weakTopics.map(([name]) => name).join(', ')}. Review the concepts, then try the questions again.` : 'Great job on this sample. Try another topic or review the full course outline.'}</p>`
            : '<p>Complete a test to get topic-specific recommendations.</p>'
    }`;
})();
