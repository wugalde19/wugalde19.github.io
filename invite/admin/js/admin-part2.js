/**
 * Load confirmations from API
 */
function loadConfirmations() {
    showLoadingMessage('confirmationsTable', 'Cargando confirmaciones...');
    
    // In a real implementation, this would make an API call to get confirmations
    // For demonstration purposes, we'll use mock data
    setTimeout(() => {
        // Mock data
        confirmationsData = [
            { id: '1', inviteeId: '1', inviteeName: 'Familia García', eventType: 'ceremony', attending: true, attendingCount: 3, comment: 'Estaremos allí puntualmente', timestamp: '2023-05-10T15:30:00' },
            { id: '2', inviteeId: '1', inviteeName: 'Familia García', eventType: 'celebration', attending: true, attendingCount: 4, comment: '¡No nos lo perderemos!', timestamp: '2023-05-10T15:32:00' },
            { id: '3', inviteeId: '4', inviteeName: 'María López', eventType: 'ceremony', attending: false, attendingCount: 0, comment: 'Lo siento, no podré asistir a la ceremonia', timestamp: '2023-05-11T10:15:00' },
            { id: '4', inviteeId: '4', inviteeName: 'María López', eventType: 'celebration', attending: true, attendingCount: 2, comment: 'Pero allí estaremos para la fiesta', timestamp: '2023-05-11T10:17:00' }
        ];
        
        updateConfirmationSummary();
        renderConfirmationsTable();
    }, 500);
    
    /* 
    // Real implementation would look like this:
    fetch(`${API_CONFIG.baseUrl}?action=getConfirmations&sheetId=${API_CONFIG.sheetsIds.confirmations}`)
        .then(response => response.json())
        .then(data => {
            confirmationsData = data;
            updateConfirmationSummary();
            renderConfirmationsTable();
        })
        .catch(error => {
            console.error('Error loading confirmations:', error);
            showErrorMessage('confirmationsTable', 'Error al cargar confirmaciones. Por favor, intenta nuevamente.');
        });
    */
}

/**
 * Update confirmation summary metrics
 */
function updateConfirmationSummary() {
    // Calculate ceremony attendees
    const ceremonyCount = confirmationsData
        .filter(conf => conf.eventType === 'ceremony' && conf.attending)
        .reduce((total, conf) => total + conf.attendingCount, 0);
    
    // Calculate celebration attendees
    const celebrationCount = confirmationsData
        .filter(conf => conf.eventType === 'celebration' && conf.attending)
        .reduce((total, conf) => total + conf.attendingCount, 0);
    
    // Calculate unique respondents
    const uniqueInviteeIds = [...new Set(confirmationsData.map(conf => conf.inviteeId))];
    const totalResponses = uniqueInviteeIds.length;
    
    // Update the UI
    document.getElementById('ceremonyCount').textContent = ceremonyCount;
    document.getElementById('celebrationCount').textContent = celebrationCount;
    document.getElementById('totalResponses').textContent = totalResponses;
}

/**
 * Render confirmations table
 */
function renderConfirmationsTable() {
    const tbody = document.querySelector('#confirmationsTable tbody');
    
    if (confirmationsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-message">No hay confirmaciones para mostrar</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    confirmationsData.forEach(confirmation => {
        const tr = document.createElement('tr');
        
        // Format date
        const date = new Date(confirmation.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Event type formatted
        const eventType = confirmation.eventType === 'ceremony' ? 'Ceremonia' : 'Celebración';
        
        // Attendance formatted
        const attending = confirmation.attending 
            ? `<span class="status-badge confirmed">Asiste</span>` 
            : `<span class="status-badge declined">No asiste</span>`;
        
        tr.innerHTML = `
            <td>${confirmation.inviteeName}</td>
            <td>${eventType}</td>
            <td>${attending}</td>
            <td>${confirmation.attendingCount}</td>
            <td>${confirmation.comment || '-'}</td>
            <td>${formattedDate}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Filter confirmations based on search input and event type
 */
function filterConfirmations() {
    const searchTerm = document.getElementById('searchConfirmations').value.toLowerCase();
    const eventTypeFilter = document.getElementById('filterEventType').value;
    
    let filteredData = [...confirmationsData];
    
    // Filter by event type
    if (eventTypeFilter !== 'all') {
        filteredData = filteredData.filter(conf => conf.eventType === eventTypeFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredData = filteredData.filter(conf => 
            conf.inviteeName.toLowerCase().includes(searchTerm) || 
            (conf.comment && conf.comment.toLowerCase().includes(searchTerm))
        );
    }
    
    const tbody = document.querySelector('#confirmationsTable tbody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-message">No se encontraron resultados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredData.forEach(confirmation => {
        const tr = document.createElement('tr');
        
        // Format date
        const date = new Date(confirmation.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Event type formatted
        const eventType = confirmation.eventType === 'ceremony' ? 'Ceremonia' : 'Celebración';
        
        // Attendance formatted
        const attending = confirmation.attending 
            ? `<span class="status-badge confirmed">Asiste</span>` 
            : `<span class="status-badge declined">No asiste</span>`;
        
        tr.innerHTML = `
            <td>${confirmation.inviteeName}</td>
            <td>${eventType}</td>
            <td>${attending}</td>
            <td>${confirmation.attendingCount}</td>
            <td>${confirmation.comment || '-'}</td>
            <td>${formattedDate}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Load music suggestions from API
 */
function loadMusicSuggestions() {
    showLoadingMessage('musicTable', 'Cargando sugerencias de música...');
    
    // In a real implementation, this would make an API call to get music suggestions
    // For demonstration purposes, we'll use mock data
    setTimeout(() => {
        // Mock data
        musicSuggestionsData = [
            { id: '1', inviteeId: '1', inviteeName: 'Familia García', songTitle: 'Perfect', artist: 'Ed Sheeran', comment: 'Es una canción muy romántica', timestamp: '2023-05-10T15:35:00' },
            { id: '2', inviteeId: '2', inviteeName: 'Familia Rodríguez', songTitle: 'Thinking Out Loud', artist: 'Ed Sheeran', comment: '', timestamp: '2023-05-11T09:20:00' },
            { id: '3', inviteeId: '3', inviteeName: 'Juan Pérez', songTitle: 'Can\'t Help Falling In Love', artist: 'Elvis Presley', comment: 'Un clásico para bodas', timestamp: '2023-05-12T14:45:00' },
            { id: '4', inviteeId: '4', inviteeName: 'María López', songTitle: 'All of Me', artist: 'John Legend', comment: 'Esta canción es perfecta para el primer baile', timestamp: '2023-05-13T16:30:00' }
        ];
        
        renderMusicSuggestionsTable();
    }, 500);
    
    /* 
    // Real implementation would look like this:
    fetch(`${API_CONFIG.baseUrl}?action=getMusicSuggestions&sheetId=${API_CONFIG.sheetsIds.musicSuggestions}`)
        .then(response => response.json())
        .then(data => {
            musicSuggestionsData = data;
            renderMusicSuggestionsTable();
        })
        .catch(error => {
            console.error('Error loading music suggestions:', error);
            showErrorMessage('musicTable', 'Error al cargar sugerencias de música. Por favor, intenta nuevamente.');
        });
    */
}

/**
 * Render music suggestions table
 */
function renderMusicSuggestionsTable() {
    const tbody = document.querySelector('#musicTable tbody');
    
    if (musicSuggestionsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-message">No hay sugerencias de música para mostrar</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    musicSuggestionsData.forEach(suggestion => {
        const tr = document.createElement('tr');
        
        // Format date
        const date = new Date(suggestion.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        tr.innerHTML = `
            <td>${suggestion.inviteeName}</td>
            <td>${suggestion.songTitle}</td>
            <td>${suggestion.artist}</td>
            <td>${suggestion.comment || '-'}</td>
            <td>${formattedDate}</td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="addToSpotify('${suggestion.songTitle}', '${suggestion.artist}')">
                    <i class="fab fa-spotify"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteMusicSuggestion('${suggestion.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Filter music suggestions based on search input
 */
function filterMusicSuggestions() {
    const searchTerm = document.getElementById('searchMusic').value.toLowerCase();
    
    if (!searchTerm) {
        renderMusicSuggestionsTable();
        return;
    }
    
    const filteredData = musicSuggestionsData.filter(suggestion => 
        suggestion.songTitle.toLowerCase().includes(searchTerm) || 
        suggestion.artist.toLowerCase().includes(searchTerm) || 
        suggestion.inviteeName.toLowerCase().includes(searchTerm) || 
        (suggestion.comment && suggestion.comment.toLowerCase().includes(searchTerm))
    );
    
    const tbody = document.querySelector('#musicTable tbody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-message">No se encontraron resultados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredData.forEach(suggestion => {
        const tr = document.createElement('tr');
        
        // Format date
        const date = new Date(suggestion.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        tr.innerHTML = `
            <td>${suggestion.inviteeName}</td>
            <td>${suggestion.songTitle}</td>
            <td>${suggestion.artist}</td>
            <td>${suggestion.comment || '-'}</td>
            <td>${formattedDate}</td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="addToSpotify('${suggestion.songTitle}', '${suggestion.artist}')">
                    <i class="fab fa-spotify"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteMusicSuggestion('${suggestion.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Add song to Spotify playlist
 * @param {string} songTitle - The song title
 * @param {string} artist - The artist name
 */
function addToSpotify(songTitle, artist) {
    alert(`Agregando "${songTitle}" de ${artist} a la playlist de Spotify. Esta función requiere integración con la API de Spotify.`);
}

/**
 * Delete a music suggestion
 * @param {string} suggestionId - The suggestion ID to delete
 */
function deleteMusicSuggestion(suggestionId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta sugerencia de música?')) {
        // In a real implementation, this would make an API call to delete the suggestion
        
        // Remove from local array
        musicSuggestionsData = musicSuggestionsData.filter(suggestion => suggestion.id !== suggestionId);
        
        // Render updated table
        renderMusicSuggestionsTable();
    }
}

/**
 * Export playlist to a file
 */
function exportPlaylist() {
    if (musicSuggestionsData.length === 0) {
        alert('No hay sugerencias de música para exportar.');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Canción,Artista,Sugerido por,Comentario\n';
    
    musicSuggestionsData.forEach(suggestion => {
        csvContent += `"${suggestion.songTitle}","${suggestion.artist}","${suggestion.inviteeName}","${suggestion.comment || ''}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'playlist_boda.csv');
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

/**
 * Save event details
 * @param {Event} e - Form submit event
 */
function saveEventDetails(e) {
    e.preventDefault();
    
    const eventDetails = {
        coupleName: document.getElementById('coupleName').value,
        weddingDate: document.getElementById('weddingDate').value,
        ceremonyTime: document.getElementById('ceremonyTime').value,
        celebrationTime: document.getElementById('celebrationTime').value,
        ceremonyLocation: document.getElementById('ceremonyLocation').value,
        ceremonyAddress: document.getElementById('ceremonyAddress').value,
        celebrationLocation: document.getElementById('celebrationLocation').value,
        celebrationAddress: document.getElementById('celebrationAddress').value
    };
    
    // Save to localStorage
    localStorage.setItem('eventDetails', JSON.stringify(eventDetails));
    
    alert('Detalles del evento guardados correctamente.');
}

/**
 * Save Google Sheets settings
 * @param {Event} e - Form submit event
 */
function saveGoogleSheetsSettings(e) {
    e.preventDefault();
    
    const apiSettings = {
        inviteesSheetId: document.getElementById('inviteesSheetId').value,
        confirmationsSheetId: document.getElementById('confirmationsSheetId').value,
        musicSheetId: document.getElementById('musicSheetId').value,
        appsScriptUrl: document.getElementById('appsScriptUrl').value
    };
    
    // Save to localStorage
    localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
    
    // Update API_CONFIG
    API_CONFIG.baseUrl = apiSettings.appsScriptUrl || API_CONFIG.baseUrl;
    API_CONFIG.sheetsIds.invitees = apiSettings.inviteesSheetId || API_CONFIG.sheetsIds.invitees;
    API_CONFIG.sheetsIds.confirmations = apiSettings.confirmationsSheetId || API_CONFIG.sheetsIds.confirmations;
    API_CONFIG.sheetsIds.musicSuggestions = apiSettings.musicSheetId || API_CONFIG.sheetsIds.musicSuggestions;
    
    alert('Configuración de Google Sheets guardada correctamente.');
}

/**
 * Save invitation design settings
 * @param {Event} e - Form submit event
 */
function saveInvitationDesign(e) {
    e.preventDefault();
    
    const designSettings = {
        primaryColor: document.getElementById('primaryColor').value,
        secondaryColor: document.getElementById('secondaryColor').value,
        quote: document.getElementById('quote').value
    };
    
    // Save to localStorage
    localStorage.setItem('designSettings', JSON.stringify(designSettings));
    
    // If background image was uploaded, handle it
    const backgroundImageInput = document.getElementById('backgroundImage');
    if (backgroundImageInput.files.length > 0) {
        // In a real implementation, this would upload the file to a server
        alert('La subida de imágenes requiere un servidor para almacenarlas. Esta función es solo para demostración.');
    }
    
    alert('Diseño de invitación guardado correctamente.');
}

/**
 * Save honeymoon details
 * @param {Event} e - Form submit event
 */
function saveHoneymoonDetails(e) {
    e.preventDefault();
    
    const honeymoonDetails = {
        honeymoonText: document.getElementById('honeymoonText').value,
        bankName: document.getElementById('bankName').value,
        accountHolder: document.getElementById('accountHolder').value,
        accountNumber: document.getElementById('accountNumber').value,
        accountAlias: document.getElementById('accountAlias').value
    };
    
    // Save to localStorage
    localStorage.setItem('honeymoonDetails', JSON.stringify(honeymoonDetails));
    
    alert('Detalles de luna de miel guardados correctamente.');
} 