/* Read-only view of browser-local demo data. This is not an authenticated admin system. */
const AdminManager = (function() {
    function readList(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function init() {
        const registrations = readList('epa-registrations');
        const payments = readList('epa-payments');
        const results = readList('epa-results');
        const doubts = readList('epa-doubts');
        const stats = {
            registrations: registrations.length,
            pendingPayments: payments.filter(payment => payment.status === 'Pending Verification').length,
            testAttempts: results.length,
            doubts: doubts.length
        };
        document.querySelectorAll('[data-stat]').forEach(element => {
            element.textContent = String(stats[element.dataset.stat] ?? 0);
        });
        renderRows('registration-table', registrations, [
            ['id', 'Registration ID'], ['name', 'Student'], ['course', 'Course'], ['status', 'Status']
        ]);
        renderRows('payment-table', payments, [
            ['id', 'Registration ID'], ['name', 'Student'], ['amount', 'Amount'], ['status', 'Status']
        ], item => `₹${Number(item.amount || 0).toLocaleString('en-IN')}`);
        renderRows('doubt-table', doubts, [
            ['topic', 'Topic'], ['university', 'University'], ['status', 'Status']
        ]);
        const message = document.getElementById('admin-demo-warning');
        if (message) message.textContent = 'Static admin preview · data is limited to this browser · no authentication or server connection';
    }

    function renderRows(id, items, columns, formatter = item => String(item[columns.find(([key]) => key === 'status')?.[0]] || '—')) {
        const table = document.getElementById(id);
        if (!table) return;
        const head = document.createElement('tr');
        columns.forEach(([, label]) => {
            const cell = document.createElement('th');
            cell.scope = 'col';
            cell.textContent = label;
            head.appendChild(cell);
        });
        const body = document.createElement('tbody');
        items.forEach(item => {
            const row = document.createElement('tr');
            columns.forEach(([key]) => {
                const cell = document.createElement('td');
                cell.textContent = key === 'amount' ? formatter(item) : String(item[key] || '—');
                row.appendChild(cell);
            });
            body.appendChild(row);
        });
        if (!items.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = columns.length;
            cell.textContent = 'No browser-local demo records yet.';
            row.appendChild(cell);
            body.appendChild(row);
        }
        table.replaceChildren(head, body);
    }

    return { init };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', AdminManager.init);
else AdminManager.init();
