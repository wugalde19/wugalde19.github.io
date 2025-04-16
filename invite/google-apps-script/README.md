# Google Sheets Backend for Wedding Invitation

This directory contains the Google Apps Script code needed to connect your wedding invitation to a Google Sheets backend.

## Setup Instructions

### 1. Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Wedding Invitation Data"

### 2. Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any code in the editor
3. Copy and paste the entire code from `wedding-api.js` into the editor
4. Save the project with a name like "Wedding Invitation API"

### 3. Run the Setup Function

1. In the Apps Script editor, select the `setupSheets` function from the dropdown next to the "Run" button
2. Click "Run" to create the necessary sheets and headers
3. When prompted, grant the necessary permissions

### 4. Deploy as Web App

1. Click on **Deploy → New deployment**
2. Select **Web app** as the deployment type
3. Set the following options:
   - Description: "Wedding Invitation API"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone" (or "Anyone with Google account" for more security)
4. Click "Deploy"
5. Copy the Web App URL that's generated

### 5. Update Your Website Code

1. Open `js/api.js` in your website files
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with the URL you copied in step 4
3. Similarly, update the URL in the `admin.html` file

## Google Sheets Structure

The script will create three sheets in your Google Spreadsheet:

1. **Invitees**
   - ID: Unique identifier for each guest/family
   - Name: Name of the guest/family
   - MaxGuests: Maximum number of guests allowed
   - DateAdded: When the guest was added

2. **RSVPs**
   - ID: Unique identifier for the RSVP
   - InviteeID: Reference to the guest in the Invitees sheet
   - EventType: "ceremony" or "celebration"
   - Attending: "YES" or "NO"
   - AttendingCount: Number of people attending
   - Comment: Any message from the guest
   - DateSubmitted: When the RSVP was submitted

3. **MusicSuggestions**
   - ID: Unique identifier for the suggestion
   - InviteeID: Reference to the guest in the Invitees sheet
   - SongTitle: Title of the suggested song
   - Artist: Artist of the suggested song
   - Comment: Any additional comment
   - DateSubmitted: When the suggestion was submitted

## Adding Test Data

You can manually add entries to the Invitees sheet to test your system:

1. Generate a UUID with a formula: `=LOWER(CONCATENATE(DEC2HEX(RANDBETWEEN(0,4294967295),8),"-",DEC2HEX(RANDBETWEEN(0,65535),4),"-",DEC2HEX(RANDBETWEEN(16384,20479),4),"-",DEC2HEX(RANDBETWEEN(32768,49151),4),"-",DEC2HEX(RANDBETWEEN(0,65535),4),DEC2HEX(RANDBETWEEN(0,4294967295),8)))` (or use the admin page)
2. Add a name
3. Set the maximum number of guests
4. Add today's date

## Troubleshooting

- **CORS Issues**: If you encounter CORS errors during testing, you may need to run your site through a local server
- **Permissions**: Make sure you've granted all necessary permissions when prompted
- **Deployment**: If your web app URL stops working, you may need to create a new deployment
- **API Limits**: Google Apps Script has usage limits, but they're generally sufficient for a wedding invitation app

For more help, consult the [Google Apps Script documentation](https://developers.google.com/apps-script) 