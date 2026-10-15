/* ===== Payment Flow Logic ===== */
const PaymentManager = (function() {
    const PAYMENT_KEY = 'epa-payments';

    function init() {
        const currentReg = JSON.parse(localStorage.getItem('epa-current-reg') || '{}');
        const amount = Number(currentReg.amount) || ACADEMY_CONFIG.offerSemesterPrice;
        const regularAmount = currentReg.course === 'Full First Year'
            ? ACADEMY_CONFIG.fullYearRegularPrice
            : ACADEMY_CONFIG.regularSemesterPrice;
        const savings = regularAmount - amount;

        // Populate payment details
        const amountEl = document.querySelector('[data-payments="amount"]');
        document.querySelectorAll('[data-payments="amount"]').forEach(el => {
            el.textContent = `₹${amount.toLocaleString('en-IN')}`;
        });
        const regularEl = document.querySelector('[data-payment="regular"]');
        if (regularEl) regularEl.textContent = `₹${regularAmount.toLocaleString('en-IN')}`;
        const savingEl = document.querySelector('[data-payment="saving"]');
        if (savingEl) savingEl.textContent = `₹${savings.toLocaleString('en-IN')}`;
        const discountEl = document.querySelector('[data-payment="discount"]');
        if (discountEl) discountEl.textContent = `${Math.round(savings / regularAmount * 100)}%`;

        // Populate registration info
        const regIdEl = document.querySelector('[data-payment="reg-id"]');
        if (regIdEl && currentReg.id) regIdEl.textContent = currentReg.id;

        const nameEl = document.querySelector('[data-payment="name"]');
        if (nameEl && currentReg.name) nameEl.textContent = currentReg.name;

        const semEl = document.querySelector('[data-payment="semester"]');
        if (semEl && currentReg.course) semEl.textContent = currentReg.course;
        const courseTitle = document.querySelector('[data-payment="course-title"]');
        if (courseTitle && currentReg.course) courseTitle.textContent = currentReg.course;

        // Set UPI ID
        const upiEl = document.querySelector('[data-payment="upi"]');
        if (upiEl) upiEl.textContent = ACADEMY_CONFIG.upiId;

        // Set QR code path
        const qrEl = document.querySelector('[data-payment="qr"]');
        if (qrEl) {
            qrEl.src = ACADEMY_CONFIG.paymentQR;
            qrEl.alt = `Payment QR for ${ACADEMY_CONFIG.brandName}`;
        }

        // WhatsApp button
        const waBtn = document.querySelector('[data-payment="whatsapp"]');
        if (waBtn) {
            waBtn.addEventListener('click', () => {
                const message = `Hello ${ACADEMY_CONFIG.brandName},\n\nI have completed my course payment.\n\nRegistration ID: ${currentReg.id || ''}\nStudent Name: ${currentReg.name || ''}\nCourse: ${currentReg.course || ''}\nAmount: ₹${amount}\nTransaction ID: [Please enter UTR/Transaction ID]\n\nI am sending the payment screenshot via WhatsApp.`;
                openWhatsApp(message);
            });
        }
        const copyButton = document.querySelector('[data-payment="copy-upi"]');
        if (copyButton) {
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(ACADEMY_CONFIG.upiId);
                    NotificationManager.show('UPI ID copied to clipboard.', 'success');
                } catch (error) {
                    NotificationManager.show('Copy is unavailable in this browser. Select the UPI ID to copy it.', 'warning');
                }
            });
        }

        // Generate UPI payment URL
        const upiBtn = document.querySelector('[data-payment="upi-pay"]');
        if (upiBtn) {
            upiBtn.href = `upi://pay?pa=${encodeURIComponent(ACADEMY_CONFIG.upiId)}&pn=${encodeURIComponent(ACADEMY_CONFIG.brandName)}&tn=${encodeURIComponent(currentReg.course || 'Engineering Physics course fee')}&am=${amount}&cu=INR`;
        }

        // Payment confirmation form
        const confirmForm = document.getElementById('payment-confirmation-form');
        if (confirmForm) {
            const regId = confirmForm.elements.RegistrationId;
            const studentName = confirmForm.elements.StudentName;
            const course = confirmForm.elements.Semester;
            const paymentAmount = confirmForm.elements.Amount;
            const paymentDate = confirmForm.elements.PaymentDate;
            if (regId) regId.value = currentReg.id || '';
            if (studentName && currentReg.name) studentName.value = currentReg.name;
            if (course && currentReg.course) course.value = currentReg.course;
            if (paymentAmount) paymentAmount.value = String(amount);
            if (paymentDate && !paymentDate.value) paymentDate.value = new Date().toISOString().slice(0, 10);
            confirmForm.addEventListener('submit', handleConfirmation);
        }
    }

    function handleConfirmation(e) {
        e.preventDefault();
        const form = e.target;
        const currentReg = JSON.parse(localStorage.getItem('epa-current-reg') || '{}');
        if (!currentReg.id) {
            NotificationManager.show('Please complete registration before submitting payment details.', 'warning');
            return;
        }

        if (!form.elements.TransactionId.value.trim()) {
            NotificationManager.show('Please enter the transaction ID', 'error');
            return;
        }

        if (!form.elements.ScreenshotUpload.files || !form.elements.ScreenshotUpload.files.length) {
            NotificationManager.show('Please upload your payment screenshot', 'error');
            return;
        }
        const screenshot = form.elements.ScreenshotUpload.files[0];
        if ((!screenshot.type.startsWith('image/') && screenshot.type !== 'application/pdf') || screenshot.size > 10 * 1024 * 1024) {
            NotificationManager.show('Choose a JPG, PNG, WebP or PDF file smaller than 10 MB.', 'error');
            return;
        }

        if (!form.elements.ConfirmationCheckbox.checked) {
            NotificationManager.show('Please confirm the information is correct', 'error');
            return;
        }
        const expectedAmount = Number(currentReg.amount) || ACADEMY_CONFIG.offerSemesterPrice;
        if (Number(form.elements.Amount.value) !== expectedAmount) {
            NotificationManager.show(`Enter the registered course amount: ₹${expectedAmount.toLocaleString('en-IN')}.`, 'error');
            return;
        }
        if (form.elements.StudentName.value.trim() !== currentReg.name || form.elements.Semester.value !== currentReg.course) {
            NotificationManager.show('Student and course details do not match this registration. Please return to your registration.', 'error');
            return;
        }

        const paymentData = {
            id: currentReg.id,
            name: currentReg.name,
            course: currentReg.course,
            amount: expectedAmount,
            transactionId: form.elements.TransactionId.value.trim(),
            date: form.elements.PaymentDate.value || new Date().toISOString().slice(0, 10),
            screenshot: `${screenshot.name} (${Math.ceil(screenshot.size / 1024)} KB)`,
            status: 'Pending Verification'
        };

        savePayment(paymentData);
        const status = document.getElementById('payment-status');
        if (status) {
            status.textContent = 'Confirmation saved on this device · Pending manual verification';
            status.classList.add('status-pending');
        }
        NotificationManager.show('Confirmation saved in this browser. No payment verification has occurred.', 'success');
        form.reset();
    }

    function savePayment(data) {
        const existing = JSON.parse(localStorage.getItem(PAYMENT_KEY) || '[]');
        existing.unshift(data);
        localStorage.setItem(PAYMENT_KEY, JSON.stringify(existing));
    }

    function getPayments() {
        return JSON.parse(localStorage.getItem(PAYMENT_KEY) || '[]');
    }

    function getPaymentById(id) {
        return getPayments().find(p => p.id === id);
    }

    return { init, getPayments, getPaymentById };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PaymentManager.init);
} else {
    PaymentManager.init();
}