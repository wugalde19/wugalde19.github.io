// API configuration
const API_CONFIG = {
    // Google Apps Script deployed as web app URL
    baseUrl: 'https://script.google.com/macros/s/AKfycbyBYnFttXUukTS_jR4fQroPzFTKL_K0xA8opxw62-_UderTt5fB8vGlfXpJNBRHE2z1/exec',
    
    // Sheets IDs
    sheetsIds: {
        invitees: '1YOUR_INVITEES_SHEET_ID',
        confirmations: '1YOUR_CONFIRMATIONS_SHEET_ID',
        musicSuggestions: '1YOUR_MUSIC_SUGGESTIONS_SHEET_ID'
    }
};

/**
 * Get invitee data from Google Sheets
 * @param {string} inviteeId - The ID of the invitee
 * @returns {Promise<Object>} - The invitee data
 */
async function getInviteeData(inviteeId) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}?action=getInvitee&id=${inviteeId}`, {
            method: 'GET',
            mode: 'cors', // Explicitly set CORS mode
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to load invitee data');
        }
    } catch (error) {
        console.error('Error loading invitee data:', error);
        throw error;
    }
}

/**
 * Submit confirmation data to Google Sheets
 * @param {Object} data - The confirmation data
 * @returns {Promise<Object>} - The response from the API
 */
async function submitConfirmationData(data) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}`, {
            method: 'POST',
            mode: 'cors', // Explicitly set CORS mode
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'submitRSVP',
                inviteeId: data.inviteeId,
                eventType: data.eventType,
                attending: data.attending,
                attendingCount: data.attendingCount,
                comment: data.comment
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return { success: true };
        } else {
            throw new Error(result.message || 'Failed to submit RSVP');
        }
    } catch (error) {
        console.error('Error submitting confirmation:', error);
        throw error;
    }
}

/**
 * Submit music suggestion to Google Sheets
 * @param {Object} data - The music suggestion data
 * @returns {Promise<Object>} - The response from the API
 */
async function submitMusicSuggestionData(data) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}`, {
            method: 'POST',
            mode: 'cors', // Explicitly set CORS mode
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'submitMusicSuggestion',
                inviteeId: data.inviteeId,
                songTitle: data.songTitle,
                artist: data.artist,
                comment: data.comment
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return { success: true };
        } else {
            throw new Error(result.message || 'Failed to submit music suggestion');
        }
    } catch (error) {
        console.error('Error submitting music suggestion:', error);
        throw error;
    }
}

/**
 * Generate PDF invitation
 * @param {string} inviteeId - The ID of the invitee
 * @returns {Promise<string>} - The URL of the generated PDF
 */
async function generatePDF(inviteeId) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}`, {
            method: 'POST',
            mode: 'cors', // Explicitly set CORS mode
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'generatePDF',
                inviteeId: inviteeId
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success' && result.pdfUrl) {
            return result.pdfUrl;
        } else {
            throw new Error(result.message || 'Failed to generate PDF invitation');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

// Export the API functions
export {
    getInviteeData,
    submitConfirmationData,
    submitMusicSuggestionData,
    generatePDF
}; 