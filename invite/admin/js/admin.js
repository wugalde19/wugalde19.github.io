// API configuration - should match what's in the main site's api.js
const API_CONFIG = {
    // Google Apps Script deployed as web app URL
    baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    // Sheets IDs
    sheetsIds: {
        invitees: '1YOUR_INVITEES_SHEET_ID',
        confirmations: '1YOUR_CONFIRMATIONS_SHEET_ID',
        musicSuggestions: '1YOUR_MUSIC_SUGGESTIONS_SHEET_ID'
    }
};

// Global variables
let inviteesData = [];
let confirmationsData = [];
let musicSuggestionsData = [];

// DOM elements
const tabLinks = document.querySelectorAll('.admin-nav a');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initTabs();
    
    // Load settings from localStorage
    loadSettings();
    
    // Add event listeners
    addEventListeners();
    
    // Load initial data
    loadInvitees();
});

/**
 * Initialize tabs functionality
 */
function initTabs() {
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab
            this.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Load data for the active tab if not already loaded
            if (tabId === 'invitees' && inviteesData.length === 0) {
                loadInvitees();
            } else if (tabId === 'confirmations' && confirmationsData.length === 0) {
                loadConfirmations();
            } else if (tabId === 'music' && musicSuggestionsData.length === 0) {
                loadMusicSuggestions();
            }
        });
    });
}

/**
 * Add event listeners to buttons and forms
 */
function addEventListeners() {
    // Invitees tab
    document.getElementById('refreshInvitees').addEventListener('click', loadInvitees);
    document.getElementById('addInvitee').addEventListener('click', () => openInviteeModal());
    document.getElementById('searchInvitees').addEventListener('input', filterInvitees);
    
    // Confirmations tab
    document.getElementById('refreshConfirmations').addEventListener('click', loadConfirmations);
    document.getElementById('searchConfirmations').addEventListener('input', filterConfirmations);
    document.getElementById('filterEventType').addEventListener('change', filterConfirmations);
    
    // Music tab
    document.getElementById('refreshMusic').addEventListener('click', loadMusicSuggestions);
    document.getElementById('exportPlaylist').addEventListener('click', exportPlaylist);
    document.getElementById('searchMusic').addEventListener('input', filterMusicSuggestions);
    
    // Settings forms
    document.getElementById('eventDetailsForm').addEventListener('submit', saveEventDetails);
    document.getElementById('googleSheetsForm').addEventListener('submit', saveGoogleSheetsSettings);
    document.getElementById('invitationDesignForm').addEventListener('submit', saveInvitationDesign);
    document.getElementById('honeymoonDetailsForm').addEventListener('submit', saveHoneymoonDetails);
    
    // Invitee modal
    document.getElementById('inviteeForm').addEventListener('submit', saveInvitee);
    document.getElementById('cancelInvitee').addEventListener('click', closeInviteeModal);
    
    // Close modals when clicking on X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            // Find the parent modal
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Retry PDF generation
    document.getElementById('retryPdf').addEventListener('click', function() {
        const inviteeId = document.getElementById('pdfModal').getAttribute('data-invitee-id');
        if (inviteeId) {
            generatePDFInvitation(inviteeId);
        }
    });
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
    // Load API settings
    const apiSettings = localStorage.getItem('apiSettings');
    if (apiSettings) {
        const settings = JSON.parse(apiSettings);
        
        document.getElementById('inviteesSheetId').value = settings.inviteesSheetId || '';
        document.getElementById('confirmationsSheetId').value = settings.confirmationsSheetId || '';
        document.getElementById('musicSheetId').value = settings.musicSheetId || '';
        document.getElementById('appsScriptUrl').value = settings.appsScriptUrl || '';
        
        // Update API_CONFIG with stored settings
        API_CONFIG.baseUrl = settings.appsScriptUrl || API_CONFIG.baseUrl;
        API_CONFIG.sheetsIds.invitees = settings.inviteesSheetId || API_CONFIG.sheetsIds.invitees;
        API_CONFIG.sheetsIds.confirmations = settings.confirmationsSheetId || API_CONFIG.sheetsIds.confirmations;
        API_CONFIG.sheetsIds.musicSuggestions = settings.musicSheetId || API_CONFIG.sheetsIds.musicSuggestions;
    }
    
    // Load event details
    const eventDetails = localStorage.getItem('eventDetails');
    if (eventDetails) {
        const details = JSON.parse(eventDetails);
        
        document.getElementById('coupleName').value = details.coupleName || 'Danny & Sofía';
        document.getElementById('weddingDate').value = details.weddingDate || '2025-09-15';
        document.getElementById('ceremonyTime').value = details.ceremonyTime || '14:00';
        document.getElementById('celebrationTime').value = details.celebrationTime || '15:30';
        document.getElementById('ceremonyLocation').value = details.ceremonyLocation || 'Parroquia Nuestra Señora de Lujan';
        document.getElementById('ceremonyAddress').value = details.ceremonyAddress || 'Av. Pergamino 203 - San José';
        document.getElementById('celebrationLocation').value = details.celebrationLocation || 'Salon de fiestas Avril';
        document.getElementById('celebrationAddress').value = details.celebrationAddress || 'Av. Los Reartes 12 - San José';
    }
    
    // Load design settings
    const designSettings = localStorage.getItem('designSettings');
    if (designSettings) {
        const settings = JSON.parse(designSettings);
        
        document.getElementById('primaryColor').value = settings.primaryColor || '#a87e6f';
        document.getElementById('secondaryColor').value = settings.secondaryColor || '#d6b6a6';
        document.getElementById('quote').value = settings.quote || 'Todos somos mortales, hasta el primer beso y la segunda copa de vino';
    }
    
    // Load honeymoon details
    const honeymoonDetails = localStorage.getItem('honeymoonDetails');
    if (honeymoonDetails) {
        const details = JSON.parse(honeymoonDetails);
        
        document.getElementById('honeymoonText').value = details.honeymoonText || '';
        document.getElementById('bankName').value = details.bankName || '';
        document.getElementById('accountHolder').value = details.accountHolder || '';
        document.getElementById('accountNumber').value = details.accountNumber || '';
        document.getElementById('accountAlias').value = details.accountAlias || '';
    }
}

/**
 * Load invitees from API
 */
function loadInvitees() {
    showLoadingMessage('inviteesTable', 'Cargando invitados...');
    
    // In a real implementation, this would make an API call to get invitees
    // For demonstration purposes, we'll use mock data
    setTimeout(() => {
        // Mock data
        inviteesData = [
            { id: '1', name: 'Familia García', maxGuests: 4, email: 'garcia@example.com', confirmed: true },
            { id: '2', name: 'Familia Rodríguez', maxGuests: 3, email: 'rodriguez@example.com', confirmed: false },
            { id: '3', name: 'Juan Pérez', maxGuests: 2, email: 'juan@example.com', confirmed: false },
            { id: '4', name: 'María López', maxGuests: 2, email: 'maria@example.com', confirmed: true },
            { id: '5', name: 'Carlos Sánchez', maxGuests: 1, email: 'carlos@example.com', confirmed: false }
        ];
        
        renderInviteesTable();
    }, 500);
    
    /* 
    // Real implementation would look like this:
    fetch(`${API_CONFIG.baseUrl}?action=getInvitees&sheetId=${API_CONFIG.sheetsIds.invitees}`)
        .then(response => response.json())
        .then(data => {
            inviteesData = data;
            renderInviteesTable();
        })
        .catch(error => {
            console.error('Error loading invitees:', error);
            showErrorMessage('inviteesTable', 'Error al cargar invitados. Por favor, intenta nuevamente.');
        });
    */
}

/**
 * Render invitees table
 */
function renderInviteesTable() {
    const tbody = document.querySelector('#inviteesTable tbody');
    
    if (inviteesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-message">No hay invitados para mostrar</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    inviteesData.forEach(invitee => {
        const tr = document.createElement('tr');
        
        // Status badge
        const statusBadge = invitee.confirmed 
            ? '<span class="status-badge confirmed">Confirmado</span>' 
            : '<span class="status-badge pending">Pendiente</span>';
        
        tr.innerHTML = `
            <td>${invitee.id}</td>
            <td>${invitee.name}</td>
            <td>${invitee.maxGuests}</td>
            <td>${invitee.email || '-'}</td>
            <td>${statusBadge}</td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="editInvitee('${invitee.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-success btn-sm" onclick="generatePDFInvitation('${invitee.id}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteInvitee('${invitee.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Filter invitees based on search input
 */
function filterInvitees() {
    const searchTerm = document.getElementById('searchInvitees').value.toLowerCase();
    
    if (!searchTerm) {
        renderInviteesTable();
        return;
    }
    
    const filteredData = inviteesData.filter(invitee => 
        invitee.name.toLowerCase().includes(searchTerm) || 
        (invitee.email && invitee.email.toLowerCase().includes(searchTerm))
    );
    
    const tbody = document.querySelector('#inviteesTable tbody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-message">No se encontraron resultados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredData.forEach(invitee => {
        const tr = document.createElement('tr');
        
        // Status badge
        const statusBadge = invitee.confirmed 
            ? '<span class="status-badge confirmed">Confirmado</span>' 
            : '<span class="status-badge pending">Pendiente</span>';
        
        tr.innerHTML = `
            <td>${invitee.id}</td>
            <td>${invitee.name}</td>
            <td>${invitee.maxGuests}</td>
            <td>${invitee.email || '-'}</td>
            <td>${statusBadge}</td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="editInvitee('${invitee.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-success btn-sm" onclick="generatePDFInvitation('${invitee.id}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteInvitee('${invitee.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Open invitee modal for adding or editing
 * @param {string} inviteeId - Optional invitee ID for editing
 */
function openInviteeModal(inviteeId) {
    const modal = document.getElementById('inviteeModal');
    const modalTitle = document.getElementById('inviteeModalTitle');
    const form = document.getElementById('inviteeForm');
    
    // Reset form
    form.reset();
    
    if (inviteeId) {
        // Editing existing invitee
        modalTitle.textContent = 'Editar Invitado';
        
        // Find invitee data
        const invitee = inviteesData.find(inv => inv.id === inviteeId);
        
        if (invitee) {
            document.getElementById('inviteeId').value = invitee.id;
            document.getElementById('inviteeName').value = invitee.name;
            document.getElementById('inviteeEmail').value = invitee.email || '';
            document.getElementById('inviteeGuests').value = invitee.maxGuests;
            document.getElementById('inviteeNotes').value = invitee.notes || '';
        }
    } else {
        // Adding new invitee
        modalTitle.textContent = 'Agregar Nuevo Invitado';
        document.getElementById('inviteeId').value = '';
    }
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Close invitee modal
 */
function closeInviteeModal() {
    document.getElementById('inviteeModal').style.display = 'none';
}

/**
 * Save invitee data
 * @param {Event} e - Form submit event
 */
function saveInvitee(e) {
    e.preventDefault();
    
    const inviteeId = document.getElementById('inviteeId').value;
    const name = document.getElementById('inviteeName').value;
    const email = document.getElementById('inviteeEmail').value;
    const maxGuests = parseInt(document.getElementById('inviteeGuests').value);
    const notes = document.getElementById('inviteeNotes').value;
    
    // In a real implementation, this would make an API call to save the invitee
    if (inviteeId) {
        // Update existing invitee
        const index = inviteesData.findIndex(inv => inv.id === inviteeId);
        
        if (index !== -1) {
            inviteesData[index] = {
                ...inviteesData[index],
                name,
                email,
                maxGuests,
                notes
            };
        }
    } else {
        // Add new invitee
        const newId = (Math.max(...inviteesData.map(inv => parseInt(inv.id))) + 1).toString();
        
        inviteesData.push({
            id: newId,
            name,
            email,
            maxGuests,
            notes,
            confirmed: false
        });
    }
    
    // Close modal
    closeInviteeModal();
    
    // Render updated table
    renderInviteesTable();
}

/**
 * Edit an invitee
 * @param {string} inviteeId - The invitee ID to edit
 */
function editInvitee(inviteeId) {
    openInviteeModal(inviteeId);
}

/**
 * Delete an invitee
 * @param {string} inviteeId - The invitee ID to delete
 */
function deleteInvitee(inviteeId) {
    if (confirm('¿Estás seguro de que deseas eliminar este invitado?')) {
        // In a real implementation, this would make an API call to delete the invitee
        
        // Remove from local array
        inviteesData = inviteesData.filter(inv => inv.id !== inviteeId);
        
        // Render updated table
        renderInviteesTable();
    }
}

/**
 * Generate PDF invitation for an invitee
 * @param {string} inviteeId - The invitee ID
 */
function generatePDFInvitation(inviteeId) {
    const modal = document.getElementById('pdfModal');
    modal.setAttribute('data-invitee-id', inviteeId);
    
    // Show loading state
    document.querySelector('.pdf-loading').style.display = 'block';
    document.querySelector('.pdf-success').style.display = 'none';
    document.querySelector('.pdf-error').style.display = 'none';
    
    // Show modal
    modal.style.display = 'block';
    
    // In a real implementation, this would make an API call to generate the PDF
    setTimeout(() => {
        // Simulate success
        document.querySelector('.pdf-loading').style.display = 'none';
        document.querySelector('.pdf-success').style.display = 'block';
        
        // Set download link
        document.getElementById('pdfDownloadLink').href = `invitations/invitation_${inviteeId}.pdf`;
    }, 2000);
    
    /* 
    // Real implementation would look like this:
    fetch(`${API_CONFIG.baseUrl}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'generatePDF',
            inviteeId: inviteeId
        }),
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector('.pdf-loading').style.display = 'none';
        
        if (data.success) {
            document.querySelector('.pdf-success').style.display = 'block';
            document.getElementById('pdfDownloadLink').href = data.pdfUrl;
        } else {
            document.querySelector('.pdf-error').style.display = 'block';
            console.error('Error generating PDF:', data.error);
        }
    })
    .catch(error => {
        document.querySelector('.pdf-loading').style.display = 'none';
        document.querySelector('.pdf-error').style.display = 'block';
        console.error('Error generating PDF:', error);
    });
    */
}

/**
 * Show loading message in a table
 * @param {string} tableId - The table ID
 * @param {string} message - The loading message
 */
function showLoadingMessage(tableId, message) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = `<tr><td colspan="6" class="loading-message">${message}</td></tr>`;
}

/**
 * Show error message in a table
 * @param {string} tableId - The table ID
 * @param {string} message - The error message
 */
function showErrorMessage(tableId, message) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = `<tr><td colspan="6" class="loading-message" style="color: var(--danger-color);">${message}</td></tr>`;
} 