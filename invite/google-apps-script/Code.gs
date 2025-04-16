/**
 * Wedding Invitation Google Sheets Integration
 * This script allows:
 * 1. Reading invitee data from a Google Sheet
 * 2. Storing confirmation responses in another sheet
 * 3. Storing music suggestions in a third sheet
 * 4. Generating PDF versions of invitations
 */

// Configuration for spreadsheets
const CONFIG = {
  inviteeSheetId: 'YOUR_INVITEES_SHEET_ID',
  confirmationsSheetId: 'YOUR_CONFIRMATIONS_SHEET_ID',
  musicSuggestionsSheetId: 'YOUR_MUSIC_SUGGESTIONS_SHEET_ID',
  // Sheet names within each spreadsheet
  inviteeSheetName: 'Invitees',
  confirmationsSheetName: 'Confirmations',
  musicSuggestionsSheetName: 'MusicSuggestions'
};

/**
 * Main entry point for web app
 * @param {Object} e - Event object from request
 * @returns {Object} - JSON response
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case 'getInvitee':
        return handleGetInvitee(e);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Process POST requests
 * @param {Object} e - Event object from request
 * @returns {Object} - JSON response
 */
function doPost(e) {
  try {
    // Parse request data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (error) {
      return jsonResponse({ error: 'Invalid JSON data' }, 400);
    }
    
    const action = data.action;
    
    switch (action) {
      case 'submitConfirmation':
        return handleSubmitConfirmation(data);
      case 'submitMusicSuggestion':
        return handleSubmitMusicSuggestion(data);
      case 'generatePDF':
        return handleGeneratePDF(data);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle getting invitee data
 * @param {Object} e - Event object with parameters
 * @returns {Object} - JSON response with invitee data
 */
function handleGetInvitee(e) {
  const inviteeId = e.parameter.id;
  
  if (!inviteeId) {
    return jsonResponse({ error: 'Missing invitee ID' }, 400);
  }
  
  const inviteeData = getInviteeById(inviteeId);
  
  if (!inviteeData) {
    return jsonResponse({ error: 'Invitee not found' }, 404);
  }
  
  return jsonResponse(inviteeData);
}

/**
 * Find invitee data by ID
 * @param {string} inviteeId - The invitee ID to search for
 * @returns {Object|null} - Invitee data or null if not found
 */
function getInviteeById(inviteeId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.inviteeSheetId);
    const sheet = ss.getSheetByName(CONFIG.inviteeSheetName);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) {
      throw new Error('ID column not found in invitees sheet');
    }
    
    // Find the row with matching ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === inviteeId) {
        // Convert row data to object using headers
        const invitee = {};
        headers.forEach((header, index) => {
          invitee[header] = data[i][index];
        });
        return invitee;
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Error in getInviteeById: ' + error.message);
    throw error;
  }
}

/**
 * Handle confirmation submission
 * @param {Object} data - The data from the request
 * @returns {Object} - JSON response
 */
function handleSubmitConfirmation(data) {
  try {
    const confirmationData = data.data;
    
    if (!confirmationData || !confirmationData.inviteeId) {
      return jsonResponse({ error: 'Invalid confirmation data' }, 400);
    }
    
    // Save confirmation to spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.confirmationsSheetId);
    const sheet = ss.getSheetByName(CONFIG.confirmationsSheetName);
    
    // Get headers from first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Create row data array
    const rowData = [];
    headers.forEach(header => {
      switch (header) {
        case 'inviteeId':
          rowData.push(confirmationData.inviteeId);
          break;
        case 'eventType':
          rowData.push(confirmationData.eventType);
          break;
        case 'attending':
          rowData.push(confirmationData.attending);
          break;
        case 'attendingCount':
          rowData.push(confirmationData.attendingCount);
          break;
        case 'comment':
          rowData.push(confirmationData.comment);
          break;
        case 'timestamp':
          rowData.push(new Date());
          break;
        default:
          rowData.push('');
      }
    });
    
    // Append data to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return jsonResponse({
      success: true,
      message: 'Confirmation saved successfully'
    });
  } catch (error) {
    Logger.log('Error in handleSubmitConfirmation: ' + error.message);
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle music suggestion submission
 * @param {Object} data - The data from the request
 * @returns {Object} - JSON response
 */
function handleSubmitMusicSuggestion(data) {
  try {
    const musicData = data.data;
    
    if (!musicData || !musicData.songTitle || !musicData.artist) {
      return jsonResponse({ error: 'Invalid music suggestion data' }, 400);
    }
    
    // Save music suggestion to spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.musicSuggestionsSheetId);
    const sheet = ss.getSheetByName(CONFIG.musicSuggestionsSheetName);
    
    // Get headers from first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Create row data array
    const rowData = [];
    headers.forEach(header => {
      switch (header) {
        case 'inviteeId':
          rowData.push(musicData.inviteeId || '');
          break;
        case 'songTitle':
          rowData.push(musicData.songTitle);
          break;
        case 'artist':
          rowData.push(musicData.artist);
          break;
        case 'comment':
          rowData.push(musicData.comment || '');
          break;
        case 'timestamp':
          rowData.push(new Date());
          break;
        default:
          rowData.push('');
      }
    });
    
    // Append data to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return jsonResponse({
      success: true,
      message: 'Music suggestion saved successfully'
    });
  } catch (error) {
    Logger.log('Error in handleSubmitMusicSuggestion: ' + error.message);
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle PDF generation request
 * @param {Object} data - The data from the request
 * @returns {Object} - JSON response with PDF URL
 */
function handleGeneratePDF(data) {
  try {
    const inviteeId = data.inviteeId;
    
    if (!inviteeId) {
      return jsonResponse({ error: 'Missing invitee ID' }, 400);
    }
    
    // Get invitee data
    const inviteeData = getInviteeById(inviteeId);
    
    if (!inviteeData) {
      return jsonResponse({ error: 'Invitee not found' }, 404);
    }
    
    // Generate PDF
    const pdfBlob = generateInvitationPDF(inviteeData);
    
    // Save to Drive
    const folder = getOrCreateFolder('WeddingInvitations');
    const fileName = `Invitation_${inviteeData.name.replace(/\s+/g, '_')}_${inviteeId}.pdf`;
    const file = folder.createFile(pdfBlob.setName(fileName));
    
    // Make the file accessible to anyone with the link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return PDF URL
    return jsonResponse({
      success: true,
      pdfUrl: file.getUrl(),
      message: 'PDF generated successfully'
    });
  } catch (error) {
    Logger.log('Error in handleGeneratePDF: ' + error.message);
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Generate PDF for invitation
 * @param {Object} inviteeData - The invitee data
 * @returns {Blob} - PDF blob
 */
function generateInvitationPDF(inviteeData) {
  // Create HTML template for PDF
  const template = HtmlService.createTemplateFromFile('invitation_template');
  template.invitee = inviteeData;
  
  // Set wedding details
  template.weddingDate = 'Lunes 15 de Septiembre';
  template.ceremonyTime = '14hs';
  template.ceremonyLocation = 'Parroquia Nuestra Señora de Lujan';
  template.ceremonyAddress = 'Av. Pergamino 203 - San José';
  template.celebrationTime = '15hs';
  template.celebrationLocation = 'Salon de fiestas Avril';
  template.celebrationAddress = 'Av. Los Reartes 12 - San José';
  
  // Evaluate template to HTML
  const html = template.evaluate().getContent();
  
  // Convert HTML to PDF
  const options = {
    title: `Invitación para ${inviteeData.name}`,
    margin: [0.5, 0.5, 0.5, 0.5],
    documentProperties: {
      title: `Invitación para ${inviteeData.name}`,
      subject: 'Invitación de Boda - Danny y Sofía',
      author: 'Wedding App'
    }
  };
  
  return Utilities.newBlob(html, 'text/html')
    .getAs('application/pdf')
    .setName(`Invitation_${inviteeData.name.replace(/\s+/g, '_')}_${inviteeData.id}.pdf`);
}

/**
 * Get folder by name or create if not exists
 * @param {string} folderName - The folder name
 * @returns {Folder} - The folder
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**
 * Create JSON response
 * @param {Object} data - The data to send
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} - ContentService response
 */
function jsonResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setStatusCode(statusCode);
} 