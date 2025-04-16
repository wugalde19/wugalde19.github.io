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
  
  // Create output content
  let content;
  
  // Return appropriate data based on the action
  if (action === "getInvitee" && id) {
    content = getInviteeDataJson(id);
  } else if (action === "getAllInvitees") {
    content = getAllInviteesJson();
  } else if (action === "getDashboardStats") {
    content = getDashboardStatsJson();
  } else {
    // Default response if no valid action is specified
    content = JSON.stringify({
      status: "error",
      message: "Invalid action"
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
      const errorOutput = ContentService.createTextOutput(errorContent);
      errorOutput.setMimeType(ContentService.MimeType.JSON);
      
      // Add CORS headers to error responses too
      errorOutput.setHeader('Access-Control-Allow-Origin', '*');
      errorOutput.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      errorOutput.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      return errorOutput;
    }
  }
  
  const action = data.action || params.action;
  let content;
  
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
      message: "Invalid action"
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inviteesSheet = ss.getSheetByName("Invitees");
  const data = inviteesSheet.getDataRange().getValues();
  
  // Find the row with the matching ID
  for (let i = 1; i < data.length; i++) { // Start at 1 to skip header row
    if (data[i][0] === id) {
      // Return invitee data
      const invitee = {
        id: data[i][0],
        name: data[i][1],
        maxGuests: data[i][2]
      };
      
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
  if (!data.name) {
    return JSON.stringify({
      status: "error",
      message: "Name is required"
    });
  }
  
  const maxGuests = data.maxGuests || 2;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inviteesSheet = ss.getSheetByName("Invitees");
  
  // Generate a unique ID
  const id = Utilities.getUuid();
  
  // Add the invitee to the sheet
  inviteesSheet.appendRow([
    id,
    data.name,
    maxGuests,
    new Date()
  ]);
  
  return JSON.stringify({
    status: "success",
    data: { id },
    message: "Invitee created successfully"
  });
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