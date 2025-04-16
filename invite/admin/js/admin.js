// API configuration - should match what's in the main site's api.js
const API_CONFIG = {
    // Google Apps Script deployed as web app URL
    baseUrl: 'https://script.google.com/macros/s/AKfycbw70ICC3xz8_eht730jw8plwvpei85CDEToM8E3FYbGqyvAxsbcl4TO4x0s1dhsf_y1/exec',
    
    // Sheets IDs
    sheetsIds: {
        invitees: 'https://docs.google.com/spreadsheets/d/1qsYYCmNeu6Mv5n63W8i0cIYg6PItLvJOGPA1z0bHtYQ/edit?gid=0#gid=0',
        confirmations: 'https://docs.google.com/spreadsheets/d/1qsYYCmNeu6Mv5n63W8i0cIYg6PItLvJOGPA1z0bHtYQ/edit?gid=1823484116#gid=1823484116',
        musicSuggestions: 'https://docs.google.com/spreadsheets/d/1qsYYCmNeu6Mv5n63W8i0cIYg6PItLvJOGPA1z0bHtYQ/edit?gid=411775594#gid=411775594'
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
    
    // Use JSONP to fetch invitees
    fetchJsonp(`${API_CONFIG.baseUrl}?action=getAllInvitees`)
        .then(result => {
            if (result.status === 'success') {
                inviteesData = result.data;
                renderInviteesTable();
            } else {
                throw new Error(result.message || 'Failed to load invitees');
            }
        })
        .catch(error => {
            console.error('Error loading invitees:', error);
            showErrorMessage('inviteesTable', 'Error al cargar invitados. Por favor, intenta nuevamente.');
        });
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
    
    if (!name || !maxGuests) {
        alert('Name and maximum guests are required.');
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';
    
    // Prepare the data
    const data = {
        action: 'createInvitee',
        name,
        maxGuests,
        email,
        notes
    };
    
    console.log('Sending data to API:', data);
    
    // Create a form to submit the data
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', API_CONFIG.baseUrl);
    form.setAttribute('target', 'submitFrame');
    
    // Add all data parameters as hidden inputs
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', value);
            form.appendChild(input);
        }
    });
    
    // Create hidden iframe for submission
    const iframe = document.createElement('iframe');
    iframe.setAttribute('name', 'submitFrame');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Add content listener to get response from iframe
    iframe.addEventListener('load', function() {
        try {
            const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
            const responseText = iframeContent.body.innerText;
            console.log('API Response:', responseText);
            
            if (responseText) {
                try {
                    const response = JSON.parse(responseText);
                    
                    if (response.status === 'success') {
                        // Reset form and close modal
                        e.target.reset();
                        closeInviteeModal();
                        
                        // Reload invitees list
                        loadInvitees();
                        
                        // Show success message
                        showSuccessMessage('inviteesTable', 'Invitado agregado exitosamente');
                    } else {
                        // Show error message
                        console.error('Error from API:', response);
                        showErrorMessage('inviteesTable', `Error: ${response.message || 'Error desconocido'}`);
                    }
                } catch (jsonError) {
                    console.error('Error parsing JSON response:', jsonError, responseText);
                    showErrorMessage('inviteesTable', 'Error al procesar la respuesta del servidor');
                }
            } else {
                console.log('Empty response from server');
                // Still try to reload data in case it worked
                loadInvitees();
            }
        } catch (error) {
            console.error('Error handling iframe response:', error);
            showErrorMessage('inviteesTable', 'Error al guardar invitado. Por favor, intenta nuevamente.');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(iframe);
                document.body.removeChild(form);
            }, 500);
        }
    });
    
    // Handle errors
    iframe.onerror = function(error) {
        console.error('Error submitting form:', error);
        showErrorMessage('inviteesTable', 'Error al guardar invitado. Por favor, intenta nuevamente.');
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        // Clean up
        document.body.removeChild(iframe);
        document.body.removeChild(form);
    };
    
    // Add form to document and submit
    document.body.appendChild(form);
    form.submit();
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