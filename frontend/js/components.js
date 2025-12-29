// components.js
function showLoading(elementId) {
    const element = document.getElementById(elementId)
    if (element) {
        element.innerHTML = `
            <div class="flex justify-center items-center py-12">
                <div class="spinner"></div>
            </div>
        `;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId)
    if (element) {
        element.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>${message}</p>
            </div>
        `;
    }
}

function showEmpty(elementId, message = 'Tidak ada data') {
    const element = document.getElementById(elementId)
    if (element) {
        element.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <p>${message}</p>
            </div>
        `;
    }
}

function showToast(message, type = 'success') {
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type] || 'bg-gray-500'

    const toast = document.createElement('div')
    toast.className = `toast ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg`;
    toast.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">${type === 'success' ? '✓' : '!'}</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast)

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in'
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}

function createModal(title, content, onConfirm = null) {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full p-6 fade-in">
            <h3 class="text-xl font-bold mb-4">${title}</h3>
            <div class="mb-6">${content}</div>
            <div class="flex gap-2 justify-end">
                <button id="modal-cancel" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Batal
                </button>
                ${onConfirm ? `
                    <button id="modal-confirm" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Konfirmasi
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal)

    modal.querySelector('#modal-cancel').addEventListener('click', () => {
        modal.remove()
    })

    if (onConfirm) {
        modal.querySelector('#modal-confirm').addEventListener('click', () => {
            onConfirm()
            modal.remove()
        })
    }

    return modal
}

function confirmAction(message, onConfirm) {
    createModal(
        'Konfirmasi',
        `<p class="text-gray-700">${message}</p>`,
        onConfirm
    )
}

function createTable(headers, rows, actions = []) {
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
                <thead class="bg-gray-100">
                    <tr>
                        ${headers.map(h => `
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ${h}
                            </th>
                        `).join('')}
                        ${actions.length > 0 ? '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>' : ''}
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${rows.map(row => `
                        <tr class="hover:bg-gray-50">
                            ${row.cells.map(cell => `
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    ${cell}
                                </td>
                            `).join('')}
                            ${actions.length > 0 ? `
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    ${actions.map(action => `
                                        <button onclick="${action.onClick}('${row.id}')" 
                                            class="text-${action.color || 'blue'}-600 hover:underline mr-2">
                                            ${action.label}
                                        </button>
                                    `).join('')}
                                </td>
                            ` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createCard(title, value, icon = '', colorClass = 'blue') {
    return `
        <div class="bg-white p-6 rounded-lg shadow card-hover">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-gray-600 mb-2">${title}</h3>
                    <p class="text-3xl font-bold text-${colorClass}-600">${value}</p>
                </div>
                ${icon ? `<div class="text-4xl">${icon}</div>` : ''}
            </div>
        </div>
    `;
}

function createSkeletonCard() {
    return `
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="skeleton h-4 w-24 mb-4"></div>
            <div class="skeleton h-8 w-16"></div>
        </div>
    `;
}