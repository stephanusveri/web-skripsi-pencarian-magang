// utils.js
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

function formatDateTime(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

function getStatusBadge(status) {
    const badges = {
        'PENDING': 'bg-yellow-100 text-yellow-700',
        'DITERIMA': 'bg-green-100 text-green-700',
        'DITOLAK': 'bg-red-100 text-red-700',
        'BUKA': 'bg-green-100 text-green-700',
        'TUTUP': 'bg-red-100 text-red-700'
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
}

function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

function truncate(str, maxLength) {
    if (str.length <= maxLength) return str
    return str.substr(0, maxLength) + '...'
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success')
    }).catch(err => {
        console.error('Failed to copy:', err)
    })
}