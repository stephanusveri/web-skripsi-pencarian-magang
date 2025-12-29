function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6
}

function validateNIM(nim) {
    return nim.length >= 8 && /^\d+$/.test(nim);
}

function validatePhone(phone) {
    return /^[0-9+\-\s()]+$/.test(phone) && phone.length >= 10;
}

function validateURL(url) {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

function validateRequired(value) {
    return value !== null && value !== undefined && value.trim() !== ''
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId)
    if (!field) return

    clearFieldError(fieldId)

    const errorDiv = document.createElement('div')
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.id = `${fieldId}-error`;
    errorDiv.textContent = message;

    field.parentElement.appendChild(errorDiv)
    field.classList.add('border-red-500')
}

function clearFieldError(fieldId) {
    const field = document.getElementById(`${fieldId}-error`)
    if (errorDiv) errorDiv.remove()

    field.classList.remove('border-red-500')
}

function clearAllErrors(formId) {
    const form = document.getElementById(formId)
    if (!form) return

    form.querySelectorAll('.text-red-500').forEach(el => el.remove())
    form.querySelectorAll('border-red-500').forEach(el => {
        el.classList.remove('border-red-500')
    })
}

function validateForm(formId, rules) {
    clearAllErrors(formId)
    let isValid = true

    for (const [fieldId, validators] of Object.entries(rules)) {
        const field = document.getElementById(fieldId)
        if (!field) continue

        const value = field.value

        for (const validator of validators) {
            if (!validator.validate(value)) {
                showFieldError(fieldId, validator.message)
                isValid = false
                break
            }
        }
    }

    return isValid
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCall,
        api,
        checkAuth,
        logout,
        getUser,
        getToken,
        formatDate,
        formatDateTime,
        getStatusBadge,
        showToast,
        confirmAction,
        validateEmail,
        validatePassword,
        validateForm
    }
}