/* Browser-local student utilities for the static demonstration. */
(function() {
    const doubtForm = document.getElementById('doubt-form');
    const doubtList = document.getElementById('doubt-list');
    const doubtKey = 'epa-doubts';

    function readList(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function renderDoubts() {
        if (!doubtList) return;
        const doubts = readList(doubtKey);
        if (!doubts.length) {
            doubtList.innerHTML = '<div class="empty-state"><h2>No saved questions yet</h2><p>Questions submitted in this browser will appear here.</p></div>';
            return;
        }
        doubtList.replaceChildren();
        doubts.forEach(doubt => {
            const card = document.createElement('article');
            card.className = 'doubt-card';
            const heading = document.createElement('h3');
            heading.textContent = doubt.topic || `${doubt.semester} question`;
            const question = document.createElement('p');
            question.textContent = doubt.question;
            const details = document.createElement('small');
            details.textContent = `${doubt.university} · ${new Date(doubt.createdAt).toLocaleDateString()} · New · Browser demo`;
            card.append(heading, question, details);
            doubtList.appendChild(card);
        });
    }

    if (doubtForm) {
        doubtForm.addEventListener('submit', event => {
            event.preventDefault();
            const attachment = doubtForm.elements.attachment.files[0];
            if (attachment && attachment.size > 8 * 1024 * 1024) {
                NotificationManager.show('Please choose an attachment smaller than 8 MB.', 'error');
                return;
            }
            const doubts = readList(doubtKey);
            doubts.unshift({
                question: doubtForm.elements.question.value.trim(),
                university: doubtForm.elements.university.value,
                semester: doubtForm.elements.semester.value,
                topic: doubtForm.elements.topic.value.trim(),
                attachment: attachment ? attachment.name : '',
                createdAt: new Date().toISOString(),
                status: 'New'
            });
            localStorage.setItem(doubtKey, JSON.stringify(doubts));
            doubtForm.reset();
            NotificationManager.show('Question saved in this browser demo. It has not been sent to faculty.', 'success');
            renderDoubts();
        });
    }
    renderDoubts();

    const profileCard = document.getElementById('profile-card');
    if (profileCard) {
        const registration = JSON.parse(localStorage.getItem('epa-current-reg') || 'null');
        if (!registration) {
            profileCard.innerHTML = '<div class="empty-state"><h2>No demo registration found</h2><p>Register to show a local demo profile.</p></div>';
        } else {
            const entries = [
                ['Name', registration.name], ['Registration ID', registration.id],
                ['Email', registration.email], ['Mobile', registration.mobile],
                ['University', registration.university], ['College', registration.college],
                ['Branch', registration.branch], ['Course', registration.course]
            ];
            const list = document.createElement('dl');
            list.className = 'profile-details';
            entries.forEach(([label, value]) => {
                const row = document.createElement('div');
                const term = document.createElement('dt');
                const description = document.createElement('dd');
                term.textContent = label;
                description.textContent = value || 'Not provided';
                row.append(term, description);
                list.appendChild(row);
            });
            profileCard.replaceChildren(list);
        }
    }

    const paymentList = document.getElementById('payment-history-list');
    if (paymentList) {
        const payments = readList('epa-payments');
        if (!payments.length) {
            paymentList.innerHTML = '<div class="empty-state"><h2>No local payment confirmations</h2><p>Submitted demo confirmations will show here, marked as pending manual review.</p></div>';
        } else {
            paymentList.replaceChildren();
            payments.forEach(payment => {
                const card = document.createElement('article');
                card.className = 'payment-history-card';
                const title = document.createElement('h2');
                title.textContent = payment.course || 'Engineering Physics';
                const detail = document.createElement('p');
                detail.textContent = `${payment.id || 'No registration ID'} · ₹${Number(payment.amount).toLocaleString('en-IN')} · ${payment.status}`;
                const date = document.createElement('small');
                date.textContent = payment.date ? new Date(payment.date).toLocaleDateString() : '';
                card.append(title, detail, date);
                paymentList.appendChild(card);
            });
        }
    }

    const semesterFilter = document.getElementById('material-semester');
    const categoryFilter = document.getElementById('material-category');
    function filterMaterials() {
        document.querySelectorAll('.material-card').forEach(card => {
            const semesterMatches = !semesterFilter || semesterFilter.value === 'all' || card.dataset.semester === semesterFilter.value;
            const categoryMatches = !categoryFilter || categoryFilter.value === 'all' || card.dataset.category === categoryFilter.value;
            card.hidden = !(semesterMatches && categoryMatches);
        });
    }
    semesterFilter?.addEventListener('change', filterMaterials);
    categoryFilter?.addEventListener('change', filterMaterials);
    document.querySelectorAll('[data-material-download]').forEach(button => {
        button.addEventListener('click', () => NotificationManager.show('This file has not been uploaded yet.', 'info'));
    });
})();
