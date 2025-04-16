/**
 * CORS TROUBLESHOOTING:
 * 
 * If you still experience CORS issues after these changes:
 * 
 * 1. Make sure you've redeployed your Google Apps Script with the latest code
 * 2. Verify that your API_CONFIG.baseUrl points to the latest deployment URL
 * 3. Clear your browser cache or use incognito mode to test
 * 4. Check the browser console for any additional errors
 */

// API configuration
const API_CONFIG = {
    // Google Apps Script deployed as web app URL
    baseUrl: 'https://script.google.com/macros/s/AKfycbw70ICC3xz8_eht730jw8plwvpei85CDEToM8E3FYbGqyvAxsbcl4TO4x0s1dhsf_y1/exec',
    
    // Sheets IDs
    sheetsIds: {
        invitees: '1YOUR_INVITEES_SHEET_ID',
        confirmations: '1YOUR_CONFIRMATIONS_SHEET_ID',
        musicSuggestions: '1YOUR_MUSIC_SUGGESTIONS_SHEET_ID'
    }
};

/**
 * Helper function to load scripts via JSONP to bypass CORS restrictions
 * @param {string} url - The URL to fetch
 * @returns {Promise} - A promise that resolves with the data
 */
function fetchJsonp(url) {
    return new Promise((resolve, reject) => {
        // Create a unique callback name
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // Create script element
        const script = document.createElement('script');
        
        // Setup the callback function
        window[callbackName] = function(data) {
            // Clean up: remove script and delete callback
            document.body.removeChild(script);
            delete window[callbackName];
            
            // Resolve the promise with data
            resolve(data);
        };
        
        // Add callback parameter to URL
        const jsonpUrl = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
        
        // Setup script error handling
        script.onerror = function() {
            // Clean up
            document.body.removeChild(script);
            delete window[callbackName];
            
            // Reject the promise
            reject(new Error('JSONP request failed'));
        };
        
        // Set script attributes and append to DOM
        script.src = jsonpUrl;
        document.body.appendChild(script);
    });
}

/**
 * Get invitee data from Google Sheets
 * @param {string} inviteeId - The ID of the invitee
 * @returns {Promise<Object>} - The invitee data
 */
async function getInviteeData(inviteeId) {
    try {
        const result = await fetchJsonp(`${API_CONFIG.baseUrl}?action=getInvitee&id=${inviteeId}`);
        
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
 * Get all invitees (for admin page)
 * @returns {Promise<Object>} - All invitee data
 */
async function getAllInvitees() {
    try {
        const result = await fetchJsonp(`${API_CONFIG.baseUrl}?action=getAllInvitees`);
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to load invitees');
        }
    } catch (error) {
        console.error('Error loading invitees:', error);
        throw error;
    }
}

/**
 * Get dashboard stats (for admin page)
 * @returns {Promise<Object>} - Dashboard statistics
 */
async function getDashboardStats() {
    try {
        const result = await fetchJsonp(`${API_CONFIG.baseUrl}?action=getDashboardStats`);
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to load dashboard stats');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        throw error;
    }
}

/**
 * Submit confirmation data to Google Sheets using an iframe for POST request
 * @param {Object} data - The confirmation data
 * @returns {Promise<Object>} - The response from the API
 */
function submitConfirmationData(data) {
    return new Promise((resolve, reject) => {
        // Create a unique ID for the iframe
        const iframeId = 'iframe_submit_' + Math.round(100000 * Math.random());
        
        // Create an invisible iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id', iframeId);
        iframe.setAttribute('name', iframeId);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Create a form to submit the data
        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', API_CONFIG.baseUrl);
        form.setAttribute('target', iframeId);
        
        // Add action parameter
        const actionInput = document.createElement('input');
        actionInput.setAttribute('type', 'hidden');
        actionInput.setAttribute('name', 'action');
        actionInput.setAttribute('value', 'submitRSVP');
        form.appendChild(actionInput);
        
        // Add all data parameters
        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', data[key]);
            form.appendChild(input);
        });
        
        // Append form to document
        document.body.appendChild(form);
        
        // Setup response handling
        iframe.onload = function() {
            setTimeout(() => {
                // Clean up
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                
                // Resolve with success
                resolve({ success: true });
            }, 1000);
        };
        
        // Handle errors
        iframe.onerror = function() {
            // Clean up
            document.body.removeChild(iframe);
            document.body.removeChild(form);
            
            reject(new Error('Failed to submit RSVP'));
        };
        
        // Submit the form
        form.submit();
    });
}

/**
 * Submit music suggestion to Google Sheets using an iframe
 * @param {Object} data - The music suggestion data
 * @returns {Promise<Object>} - The response from the API
 */
function submitMusicSuggestionData(data) {
    return new Promise((resolve, reject) => {
        // Create a unique ID for the iframe
        const iframeId = 'iframe_music_' + Math.round(100000 * Math.random());
        
        // Create an invisible iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id', iframeId);
        iframe.setAttribute('name', iframeId);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Create a form to submit the data
        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', API_CONFIG.baseUrl);
        form.setAttribute('target', iframeId);
        
        // Add action parameter
        const actionInput = document.createElement('input');
        actionInput.setAttribute('type', 'hidden');
        actionInput.setAttribute('name', 'action');
        actionInput.setAttribute('value', 'submitMusicSuggestion');
        form.appendChild(actionInput);
        
        // Add all data parameters
        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', data[key]);
            form.appendChild(input);
        });
        
        // Append form to document
        document.body.appendChild(form);
        
        // Setup response handling
        iframe.onload = function() {
            setTimeout(() => {
                // Clean up
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                
                // Resolve with success
                resolve({ success: true });
            }, 1000);
        };
        
        // Handle errors
        iframe.onerror = function() {
            // Clean up
            document.body.removeChild(iframe);
            document.body.removeChild(form);
            
            reject(new Error('Failed to submit music suggestion'));
        };
        
        // Submit the form
        form.submit();
    });
}

/**
 * Generate PDF invitation
 * This is a placeholder function - PDF generation requires additional setup
 * @param {string} inviteeId - The ID of the invitee
 * @returns {Promise<string>} - The URL of the generated PDF
 */
function generatePDF(inviteeId) {
    // This needs to be implemented with form submission via iframe
    // For now, just return a promise that resolves with a message
    return Promise.resolve("PDF generation not implemented yet");
}

// Export the API functions
export {
    getInviteeData,
    getAllInvitees,
    getDashboardStats,
    submitConfirmationData,
    submitMusicSuggestionData,
    generatePDF
}; 