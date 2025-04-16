// Google Apps Script for Wedding Invitation API
// Copy this code into your Google Apps Script editor

/**
 * IMPORTANT DEPLOYMENT SETTINGS:
 * 
 * To fix CORS issues, you MUST deploy this script with these settings:
 * 1. Click Deploy > New deployment
 * 2. Select "Web app" as the deployment type
 * 3. For "Execute as" select "Me" (your Google account)
 * 4. For "Who has access" select "Anyone"
 * 5. Enable "Execute as API executable"
 * 6. Click "Deploy"
 * 7. Copy the Web App URL
 * 8. IMPORTANT: Make sure to re-deploy every time you make changes to the code
 */

// Set up a doGet function to handle GET requests
function doGet(e) {
  // Parse the request parameters
  const params = e.parameter;
  const action = params.action;
  const id = params.id;
  const callback = params.callback; // For JSONP support
  
  // Log the request for debugging
  Logger.log("GET Request - Action: " + action + ", ID: " + id);
  
  // Create output content
  let content;
  
  // Return appropriate data based on the action
  if (action === "getInvitee" && id) {
    // Added debugging
    Logger.log("Looking for invitee with ID: " + id);
    content = getInviteeDataJson(id);
    Logger.log("Response: " + content);
  } else if (action === "getAllInvitees") {
    content = getAllInviteesJson();
  } else if (action === "getDashboardStats") {
    content = getDashboardStatsJson();
  } else {
    // Default response if no valid action is specified
    Logger.log("Invalid action: " + action);
    content = JSON.stringify({
      status: "error",
      message: "Invalid action: " + action
    });
  }
  
  // Handle JSONP if callback is provided
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + content + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Normal JSON response with CORS headers
    const output = ContentService.createTextOutput(content);
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Add proper CORS headers
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
  }
}

// Handle POST requests (for form submissions)
function doPost(e) {
  // Parse the request parameters and payload
  let params, data;
  const callback = e.parameter.callback; // For JSONP support
  
  try {
    // Check if data is coming from form submit or JSON payload
    if (e.postData && e.postData.contents) {
      // Handle JSON data
      data = JSON.parse(e.postData.contents);
      params = e.parameter;
    } else {
      // Handle form-submitted data
      data = e.parameter;
      params = e.parameter;
    }
  } catch (err) {
    const errorContent = JSON.stringify({
      status: "error",
      message: "Invalid data format: " + err.message
    });
    
    // Handle JSONP if callback is provided
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + errorContent + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Normal JSON response with CORS headers (ContentService does not support setHeader, so only set MIME type)
      return ContentService.createTextOutput(errorContent)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  const action = data.action || params.action;
  let content;
  
  try {
    // Process based on the action
    if (action === "submitRSVP") {
      content = submitRSVPJson(data);
    } else if (action === "submitMusicSuggestion") {
      content = submitMusicSuggestionJson(data);
    } else if (action === "createInvitee") {
      content = createInviteeJson(data);
    } else {
      // Default response if no valid action is specified
      content = JSON.stringify({
        status: "error",
        message: "Invalid action: " + action
      });
    }
    
    // Handle JSONP if callback is provided
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + content + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Normal JSON response with CORS headers
      const output = ContentService.createTextOutput(content);
      output.setMimeType(ContentService.MimeType.JSON);
      
      // Add proper CORS headers
      output.setHeader('Access-Control-Allow-Origin', '*');
      output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      return output;
    }
  } catch (error) {
    // Error handling for any exceptions during processing
    Logger.log("Error in doPost: " + error.toString());
    
    const errorContent = JSON.stringify({
      status: "error",
      message: "Error processing request: " + error.toString()
    });
    
    // Handle JSONP if callback is provided
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + errorContent + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Normal JSON response with CORS headers (ContentService does not support setHeader, so only set MIME type)
      return ContentService.createTextOutput(errorContent)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

// Function to handle OPTIONS requests for CORS preflight
function doOptions(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers for preflight requests
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '3600');
  
  return output.setContent(JSON.stringify({status: "success"}));
}

// Function to get invitee data by ID as JSON string
function getInviteeDataJson(id) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inviteesSheet = ss.getSheetByName("Invitees");
    
    if (!inviteesSheet) {
      return JSON.stringify({
        status: "error",
        message: "Invitees sheet not found"
      });
    }
    
    const data = inviteesSheet.getDataRange().getValues();
    const headers = data[0]; // Get the headers from the first row
    
    // Find the row with the matching ID
    for (let i = 1; i < data.length; i++) { // Start at 1 to skip header row
      if (data[i][0] === id) {
        // Create an invitee object with all values from the row
        const invitee = {};
        
        // Map headers to values
        for (let j = 0; j < headers.length; j++) {
          invitee[headers[j].toLowerCase()] = data[i][j];
        }
        
        // Ensure maxGuests is a number
        invitee.maxguests = parseInt(invitee.maxguests) || 2;
        
        // Log for debugging
        Logger.log("Found invitee: " + JSON.stringify(invitee));
        
        return JSON.stringify({
          status: "success",
          data: invitee
        });
      }
    }
    
    // If no matching invitee found
    return JSON.stringify({
      status: "error",
      message: "Invitee not found"
    });
  } catch (error) {
    Logger.log("Error getting invitee data: " + error.toString());
    return JSON.stringify({
      status: "error",
      message: "Failed to get invitee data: " + error.toString()
    });
  }
}

// Function to get all invitees (for admin page) as JSON string
function getAllInviteesJson() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inviteesSheet = ss.getSheetByName("Invitees");
  const data = inviteesSheet.getDataRange().getValues();
  
  // Skip the header row
  const invitees = [];
  for (let i = 1; i < data.length; i++) {
    // Check if there are RSVPs for this invitee
    const status = getInviteeStatus(data[i][0]);
    
    invitees.push({
      id: data[i][0],
      name: data[i][1],
      maxGuests: data[i][2],
      dateAdded: data[i][3],
      status: status
    });
  }
  
  return JSON.stringify({
    status: "success",
    data: invitees
  });
}

// Function to get dashboard statistics as JSON string
function getDashboardStatsJson() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rsvpsSheet = ss.getSheetByName("RSVPs");
  const musicSheet = ss.getSheetByName("MusicSuggestions");
  
  const rsvpData = rsvpsSheet.getDataRange().getValues();
  const musicData = musicSheet.getDataRange().getValues();
  
  let ceremonyConfirmed = 0;
  let celebrationConfirmed = 0;
  
  // Count confirmations
  for (let i = 1; i < rsvpData.length; i++) {
    if (rsvpData[i][3] === "YES") { // If attending
      const attendingCount = rsvpData[i][4];
      
      if (rsvpData[i][2] === "ceremony") {
        ceremonyConfirmed += attendingCount;
      } else if (rsvpData[i][2] === "celebration") {
        celebrationConfirmed += attendingCount;
      }
    }
  }
  
  // Count music suggestions (subtract 1 for header row)
  const songsSuggested = musicData.length > 0 ? musicData.length - 1 : 0;
  
  return JSON.stringify({
    status: "success",
    data: {
      ceremonyConfirmed,
      celebrationConfirmed,
      songsSuggested
    }
  });
}

// Function to submit an RSVP
function submitRSVPJson(data) {
  if (!data.inviteeId || !data.eventType) {
    return JSON.stringify({
      status: "error",
      message: "Missing required data"
    });
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rsvpsSheet = ss.getSheetByName("RSVPs");
  
  // Generate a unique ID
  const id = Utilities.getUuid();
  
  // Add the RSVP to the sheet
  rsvpsSheet.appendRow([
    id,
    data.inviteeId,
    data.eventType,
    data.attending ? "YES" : "NO",
    data.attendingCount || 0,
    data.comment || "",
    new Date()
  ]);
  
  return JSON.stringify({
    status: "success",
    message: "RSVP submitted successfully"
  });
}

// Function to submit a music suggestion
function submitMusicSuggestionJson(data) {
  if (!data.inviteeId || !data.songTitle || !data.artist) {
    return JSON.stringify({
      status: "error",
      message: "Missing required data"
    });
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const suggestionsSheet = ss.getSheetByName("MusicSuggestions");
  
  // Generate a unique ID
  const id = Utilities.getUuid();
  
  // Add the suggestion to the sheet
  suggestionsSheet.appendRow([
    id,
    data.inviteeId,
    data.songTitle,
    data.artist,
    data.comment || "",
    new Date()
  ]);
  
  return JSON.stringify({
    status: "success",
    message: "Music suggestion submitted successfully"
  });
}

// Function to create a new invitee
function createInviteeJson(data) {
  try {
    // Log inputs for debugging
    Logger.log("createInviteeJson called with data: " + JSON.stringify(data));
    
    // Check for required data
    if (!data || !data.name) {
      Logger.log("Error: Name is required");
      return JSON.stringify({
        status: "error",
        message: "Name is required"
      });
    }
    
    // Parse and validate data
    const name = String(data.name).trim();
    const maxGuests = parseInt(data.maxGuests) || 2;
    const email = data.email || "";
    const notes = data.notes || "";
    const debug = data.debug === "true"; // Check if debug mode is enabled
    
    Logger.log("Validated data: name=" + name + ", maxGuests=" + maxGuests + ", debug=" + debug);
    
    // Try to access the active spreadsheet or use provided ID
    let ss;
    if (data.spreadsheetId) {
      try {
        ss = SpreadsheetApp.openById(data.spreadsheetId);
        Logger.log("Using provided spreadsheet ID: " + data.spreadsheetId);
      } catch (e) {
        Logger.log("Could not open spreadsheet with ID: " + data.spreadsheetId + ", error: " + e.toString());
        // Fall back to active spreadsheet
        ss = SpreadsheetApp.getActiveSpreadsheet();
      }
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    if (!ss) {
      Logger.log("Error: Could not access spreadsheet");
      return JSON.stringify({
        status: "error",
        message: "Could not access spreadsheet"
      });
    }
    
    Logger.log("Successfully accessed spreadsheet: " + ss.getName());
    
    // Check if Invitees sheet exists, create if not
    let inviteesSheet = ss.getSheetByName("Invitees");
    if (!inviteesSheet) {
      Logger.log("Invitees sheet not found, creating sheet structure");
      setupSheets();
      inviteesSheet = ss.getSheetByName("Invitees");
      
      if (!inviteesSheet) {
        Logger.log("Error: Failed to create Invitees sheet");
        return JSON.stringify({
          status: "error",
          message: "Failed to create Invitees sheet"
        });
      }
    }
    
    Logger.log("Successfully accessed Invitees sheet");
    
    // Generate a secure ID
    const id = generateSecureId(name);
    Logger.log("Generated secure ID: " + id);
    
    // Generate current date
    const dateAdded = new Date().toISOString();
    
    // Add the invitee to the sheet
    try {
      Logger.log("Attempting to append row to sheet");
      // Get current data to determine proper columns
      const headerRow = inviteesSheet.getRange(1, 1, 1, inviteesSheet.getLastColumn()).getValues()[0];
      Logger.log("Header row: " + headerRow.join(", "));
      
      // Prepare row data based on headers
      const rowData = [];
      
      // Required fields that must exist
      rowData.push(id); // ID
      rowData.push(name); // Name
      rowData.push(maxGuests); // MaxGuests
      
      // Determine if we need to include email, notes, dateAdded, etc.
      if (headerRow.includes("Email")) {
        rowData.push(email);
      }
      if (headerRow.includes("Notes")) {
        rowData.push(notes);
      }
      if (headerRow.includes("DateAdded")) {
        rowData.push(dateAdded);
      }
      if (headerRow.includes("Status")) {
        rowData.push("pending");
      }
      
      Logger.log("Row data to append: " + rowData.join(", "));
      inviteesSheet.appendRow(rowData);
      Logger.log("Successfully added row to sheet");
      
      // For debugging - log the data that was added
      if (debug) {
        Logger.log("DEBUGGING - Sheet data after append:");
        const lastRow = inviteesSheet.getLastRow();
        const actualRowData = inviteesSheet.getRange(lastRow, 1, 1, inviteesSheet.getLastColumn()).getValues()[0];
        Logger.log("Actual row data: " + actualRowData.join(", "));
      }
    } catch (appendError) {
      Logger.log("Error appending row: " + appendError.toString() + "\nStack: " + appendError.stack);
      return JSON.stringify({
        status: "error",
        message: "Error adding invitee to spreadsheet: " + appendError.toString()
      });
    }
    
    // Generate the invitation link for the response
    const invitationLink = "https://wugalde19.github.io/invite/invitation.html?id=" + id;
    Logger.log("Invitation link generated: " + invitationLink);
    
    return JSON.stringify({
      status: "success",
      data: { 
        id,
        name,
        maxGuests,
        email,
        notes,
        dateAdded,
        status: "pending",
        invitationLink // Include the invitation link in the response
      },
      message: "Invitee created successfully"
    });
  } catch(error) {
    Logger.log("Error creating invitee: " + error.toString() + "\nStack: " + error.stack);
    return JSON.stringify({
      status: "error",
      message: "Failed to create invitee: " + error.toString()
    });
  }
}

// Function to get the RSVP status of an invitee
function getInviteeStatus(inviteeId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rsvpsSheet = ss.getSheetByName("RSVPs");
  const data = rsvpsSheet.getDataRange().getValues();
  
  // Check if there are any RSVPs for this invitee
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === inviteeId) {
      // If there's at least one "YES" to ceremony or celebration
      if (data[i][3] === "YES") {
        return "Confirmado";
      }
    }
  }
  
  return "Pendiente";
}

// Helper function to set up sheet headers if they don't exist
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Invitees sheet if it doesn't exist
  let inviteesSheet = ss.getSheetByName("Invitees");
  if (!inviteesSheet) {
    inviteesSheet = ss.insertSheet("Invitees");
    inviteesSheet.appendRow(["ID", "Name", "MaxGuests", "DateAdded"]);
  }
  
  // Create RSVPs sheet if it doesn't exist
  let rsvpsSheet = ss.getSheetByName("RSVPs");
  if (!rsvpsSheet) {
    rsvpsSheet = ss.insertSheet("RSVPs");
    rsvpsSheet.appendRow(["ID", "InviteeID", "EventType", "Attending", "AttendingCount", "Comment", "DateSubmitted"]);
  }
  
  // Create MusicSuggestions sheet if it doesn't exist
  let musicSheet = ss.getSheetByName("MusicSuggestions");
  if (!musicSheet) {
    musicSheet = ss.insertSheet("MusicSuggestions");
    musicSheet.appendRow(["ID", "InviteeID", "SongTitle", "Artist", "Comment", "DateSubmitted"]);
  }
  
  return "Setup complete";
}

// Function to generate invitation link (for testing)
function generateInvitationLink(inviteeId) {
  // Replace with your actual website URL when deployed
  const baseUrl = "https://wugalde19.github.io/invite";
  return `${baseUrl}/invitation.html?id=${inviteeId}`;
}

// Run this function once to set up your sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Wedding App')
      .addItem('Setup Sheets', 'setupSheets')
      .addToUi();
}

// Generate a secure id based on the name and timestamp
function generateSecureId(name) {
  try {
    // Create a base string combining name and timestamp
    const timestamp = new Date().getTime();
    const baseString = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + timestamp;
    
    // Create a hash-like value from the baseString
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to a positive number
    hash = Math.abs(hash);
    
    // Convert to base36 (alphanumeric) and add a random suffix
    const randomSuffix = Math.floor(Math.random() * 1000).toString(36);
    const encodedId = hash.toString(36) + randomSuffix;
    
    // Ensure the ID is at least 6 characters long
    return encodedId.length < 6 ? encodedId + randomSuffix.repeat(2) : encodedId;
  } catch (error) {
    Logger.log("Error generating secure ID: " + error.toString());
    // Fallback to a simple encrypted timestamp if there's an error
    return "inv" + new Date().getTime().toString(36);
  }
}

/**
 * Create a new invitee
 * @param {Object} e - The event object from the form submission
 * @returns {Object} - Response object with status and message
 */
function createInvitee(e) {
  try {
    const name = e.parameter.name;
    const maxGuests = parseInt(e.parameter.maxGuests);
    const email = e.parameter.email || '';
    const notes = e.parameter.notes || '';
    
    if (!name || !maxGuests) {
      return {
        status: 'error',
        message: 'Name and maximum guests are required'
      };
    }
    
    const sheet = SpreadsheetApp.getActive().getSheetByName('Invitees');
    if (!sheet) {
      setupSheets();
    }
    
    const id = generateSecureId(name);
    const dateAdded = new Date().toISOString();
    
    // Add new row
    sheet.appendRow([
      id,
      name,
      maxGuests,
      email,
      notes,
      dateAdded,
      'pending' // Initial status
    ]);
    
    return {
      status: 'success',
      message: 'Invitee created successfully',
      data: {
        id,
        name,
        maxGuests,
        email,
        notes,
        dateAdded,
        status: 'pending'
      }
    };
  } catch (error) {
    console.error('Error creating invitee:', error);
    return {
      status: 'error',
      message: 'Failed to create invitee'
    };
  }
}

/**
 * Get all invitees
 * @returns {Object} - Response object with status and invitees data
 */
function getAllInvitees() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Invitees');
    if (!sheet) {
      return {
        status: 'error',
        message: 'Invitees sheet not found'
      };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const invitees = data.slice(1).map(row => {
      const invitee = {};
      headers.forEach((header, index) => {
        invitee[header.toLowerCase()] = row[index];
      });
      return invitee;
    });
    
    return {
      status: 'success',
      data: invitees
    };
  } catch (error) {
    console.error('Error getting invitees:', error);
    return {
      status: 'error',
      message: 'Failed to get invitees'
    };
  }
} 