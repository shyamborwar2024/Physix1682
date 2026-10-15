/* ===== Registration Logic ===== */
const RegistrationManager = (function() {
    const REG_KEY = 'epa-registrations';
    const DEMO_COURSES = ['Engineering Physics – Semester 1', 'Engineering Physics – Semester 2', 'Full First Year'];
    const branches = ['Computer Engineering', 'IT', 'AI & DS', 'AI & ML', 'E&TC', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Instrumentation', 'Robotics', 'Other'];
    const years = ['First Year', 'Second Year', 'Third Year', 'Final Year'];
    const universities = ACADEMY_CONFIG.universities;

    function init() {
        const form = document.getElementById('registration-form');
        if (!form) return;

        populateSelectors(form);
        const requestedCourse = new URLSearchParams(window.location.search).get('course');
        const courseSelect = form.querySelector('[name="Course"]');
        if (courseSelect && requestedCourse) {
            const courseValue = {
                semester1: DEMO_COURSES[0],
                semester2: DEMO_COURSES[1],
                fullYear: DEMO_COURSES[2]
            }[requestedCourse];
            if (courseValue) courseSelect.value = courseValue;
        }
        form.addEventListener('submit', handleSubmit);
    }

    function populateSelectors(form) {
        if (!form) return;

        // Branch
        const branchSelect = form.querySelector('[name="Branch"]');
        if (branchSelect && branchSelect.options.length <= 1) {
            if (branchSelect.options.length === 0) {
                branchSelect.add(new Option('Select branch', ''));
            }
            branches.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b; opt.textContent = b;
                branchSelect.appendChild(opt);
            });
        }

        // Year
        const yearSelect = form.querySelector('[name="Year"]');
        if (yearSelect && yearSelect.options.length <= 1) {
            if (yearSelect.options.length === 0) {
                yearSelect.add(new Option('Select year', ''));
            }
            years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y; opt.textContent = y;
                yearSelect.appendChild(opt);
            });
        }

        // University
        const uniSelect = form.querySelector('[name="University"]');
        if (uniSelect && uniSelect.options.length <= 1) {
            universities.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u; opt.textContent = u;
                uniSelect.appendChild(opt);
            });
        }

        // Course
        const courseSelect = form.querySelector('[name="Course"]');
        if (courseSelect && courseSelect.options.length <= 1) {
            DEMO_COURSES.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c; opt.textContent = c;
                courseSelect.appendChild(opt);
            });
        }
    }

    function generateRegistrationId() {
        const year = new Date().getFullYear();
        const existing = JSON.parse(localStorage.getItem(REG_KEY) || '[]');
        const ids = new Set(existing.map(registration => registration.id));
        let sequence = existing.reduce((largest, registration) => {
            const match = String(registration.id || '').match(/^EPA-\d{4}-(\d+)$/);
            return match ? Math.max(largest, Number(match[1])) : largest;
        }, 0) + 1;
        let id = `EPA-${year}-${String(sequence).padStart(5, '0')}`;
        while (ids.has(id)) {
            sequence += 1;
            id = `EPA-${year}-${String(sequence).padStart(5, '0')}`;
        }
        return id;
    }

    function validateForm(form) {
        const required = ['FullName', 'Mobile', 'Email', 'University', 'Branch', 'Course'];
        const errors = {};

        required.forEach(name => {
            const el = form.elements[name];
            if (!el || !el.value.trim()) {
                errors[name] = 'This field is required';
            }
        });

        if (form.elements.Email && !validateEmail(form.elements.Email.value)) {
            errors.Email = 'Please enter a valid email address';
        }

        if (form.elements.Mobile && !validateMobile(form.elements.Mobile.value)) {
            errors.Mobile = 'Please enter a valid mobile number';
        }

        return errors;
    }

    function showError(field, message) {
        const el = document.querySelector(`[name="${field}"]`);
        if (!el) return;
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        el.classList.add('error');
    }

    function clearError(field) {
        const el = document.querySelector(`[name="${field}"]`);
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) errorEl.style.display = 'none';
        if (el) el.classList.remove('error');
    }

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;

        // Clear previous errors
        ['FullName', 'Mobile', 'Email', 'University', 'Branch', 'Course'].forEach(clearError);
        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            Object.keys(errors).forEach(f => showError(f, errors[f]));
            return false;
        }

        // Generate registration ID
        const regId = generateRegistrationId();
        const regData = {
            id: regId,
            name: form.elements.FullName.value.trim(),
            mobile: form.elements.Mobile.value.trim(),
            email: form.elements.Email.value.trim(),
            university: form.elements.University.value,
            college: form.elements.College?.value.trim() || 'N/A',
            branch: form.elements.Branch.value,
            year: form.elements.Year.value,
            academicYear: form.elements.AcademicYear?.value.trim() || '',
            course: form.elements.Course.value,
            amount: form.elements.Course.value === 'Full First Year'
                ? ACADEMY_CONFIG.fullYearOfferPrice
                : ACADEMY_CONFIG.offerSemesterPrice,
            status: 'Registration Submitted - Awaiting Payment',
            createdAt: new Date().toISOString()
        };

        // Save registration
        saveRegistration(regData);

        // Store in localStorage for demo pages
        localStorage.setItem('epa-current-reg', JSON.stringify(regData));

        // Redirect to payment page
        window.location.href = 'payment.html';

        return true;
    }

    function saveRegistration(data) {
        const existing = JSON.parse(localStorage.getItem(REG_KEY) || '[]');
        existing.unshift(data);
        localStorage.setItem(REG_KEY, JSON.stringify(existing));
    }

    function getRegistrations() {
        return JSON.parse(localStorage.getItem(REG_KEY) || '[]');
    }

    function getRegistrationById(id) {
        const regs = getRegistrations();
        return regs.find(r => r.id === id);
    }

    return { init, generateRegistrationId, validateForm };
})();

// Auto login for demo
RegistrationManager.handleDemoLogin = function() {
    const demoReg = localStorage.getItem('epa-demo-reg');
    if (demoReg) {
        localStorage.setItem('epa-current-reg', demoReg);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', RegistrationManager.init);
} else {
    RegistrationManager.init();
}