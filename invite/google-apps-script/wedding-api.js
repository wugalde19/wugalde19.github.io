// Google Apps Script for Wedding Invitation API
// Copy this code into your Google Apps Script editor

// Set up a doGet function to handle GET requests
function doGet(e) {
  // Parse the request parameters
  const params = e.parameter;
  const action = params.action;
  const id = params.id;
  
  // Allow CORS for local development
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Return appropriate data based on the action
  if (action === "getInvitee" && id) {
    return getInviteeData(id, output);
  } else if (action === "getAllInvitees") {
    return getAllInvitees(output);
  } else if (action === "getDashboardStats") {
    return getDashboardStats(output);
  }
  
  // Default response if no valid action is specified
  return output.setContent(JSON.stringify({
    status: "error",
    message: "Invalid action"
  }));
}

// Handle POST requests (for form submissions)
function doPost(e) {
  // Parse the request parameters and payload
  let params, data;
  
  try {
    params = e.parameter;
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Invalid data format: " + err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = data.action || params.action;
  
  // Allow CORS for local development
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Process based on the action
  if (action === "submitRSVP") {
    return submitRSVP(data, output);
  } else if (action === "submitMusicSuggestion") {
    return submitMusicSuggestion(data, output);
  } else if (action === "createInvitee") {
    return createInvitee(data, output);
  }
  
  // Default response if no valid action is specified
  return output.setContent(JSON.stringify({
    status: "error",
    message: "Invalid action"
  }));
}

// Function to get invitee data by ID
function getInviteeData(id, output) {
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
      
      return output.setContent(JSON.stringify({
        status: "success",
        data: invitee
      }));
    }
  }
  
  // If no matching invitee found
  return output.setContent(JSON.stringify({
    status: "error",
    message: "Invitee not found"
  }));
}

// Function to get all invitees (for admin page)
function getAllInvitees(output) {
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
  
  return output.setContent(JSON.stringify({
    status: "success",
    data: invitees
  }));
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

// Function to get dashboard statistics
function getDashboardStats(output) {
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
  
  return output.setContent(JSON.stringify({
    status: "success",
    data: {
      ceremonyConfirmed,
      celebrationConfirmed,
      songsSuggested
    }
  }));
}

// Function to submit an RSVP
function submitRSVP(data, output) {
  if (!data.inviteeId || !data.eventType) {
    return output.setContent(JSON.stringify({
      status: "error",
      message: "Missing required data"
    }));
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
  
  return output.setContent(JSON.stringify({
    status: "success",
    message: "RSVP submitted successfully"
  }));
}

// Function to submit a music suggestion
function submitMusicSuggestion(data, output) {
  if (!data.inviteeId || !data.songTitle || !data.artist) {
    return output.setContent(JSON.stringify({
      status: "error",
      message: "Missing required data"
    }));
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
  
  return output.setContent(JSON.stringify({
    status: "success",
    message: "Music suggestion submitted successfully"
  }));
}

// Function to create a new invitee
function createInvitee(data, output) {
  if (!data.name) {
    return output.setContent(JSON.stringify({
      status: "error",
      message: "Name is required"
    }));
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
  
  return output.setContent(JSON.stringify({
    status: "success",
    data: { id },
    message: "Invitee created successfully"
  }));
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
  const baseUrl = "https://yourusername.github.io/wedding-invitation";
  return `${baseUrl}/invitation.html?id=${inviteeId}`;
}

// Run this function once to set up your sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Wedding App')
      .addItem('Setup Sheets', 'setupSheets')
      .addToUi();
} 