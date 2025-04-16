# Google Sheets Templates for Wedding Invitation System

This directory contains templates and instructions for setting up the Google Sheets that power the wedding invitation system.

## Overview

The system uses Google Sheets to store and manage:
- Invitee information
- Confirmation responses
- Music suggestions

Google Apps Script is used to create a web API that interfaces between the website and the Google Sheets.

## Sheet Structure

### 1. Invitees Sheet

This sheet stores information about all your wedding invitees.

**Columns:**
- `id` (string): Unique identifier for each invitee
- `name` (string): Name of the invitee or family
- `maxGuests` (number): Maximum number of guests allowed for this invitation
- `email` (string): Email address of the invitee (optional)
- `notes` (string): Any additional notes (optional)
- `confirmed` (boolean): Whether the invitee has confirmed (will be updated automatically)

Example:
| id | name | maxGuests | email | notes | confirmed |
|----|------|-----------|-------|-------|-----------|
| 1 | Familia García | 4 | garcia@example.com | Amigos cercanos | TRUE |
| 2 | Familia Rodríguez | 3 | rodriguez@example.com | Primos | FALSE |
| 3 | Juan Pérez | 2 | juan@example.com | Compañero de trabajo | FALSE |

### 2. Confirmations Sheet

This sheet stores confirmation responses from invitees.

**Columns:**
- `id` (string): Unique identifier for each confirmation
- `inviteeId` (string): ID of the invitee (references the Invitees sheet)
- `eventType` (string): Either "ceremony" or "celebration"
- `attending` (boolean): Whether the invitee is attending
- `attendingCount` (number): Number of people attending
- `comment` (string): Optional message from the invitee
- `timestamp` (datetime): When the confirmation was submitted

Example:
| id | inviteeId | eventType | attending | attendingCount | comment | timestamp |
|----|-----------|-----------|-----------|----------------|---------|-----------|
| 1 | 1 | ceremony | TRUE | 3 | Estaremos allí | 2023-05-10 15:30:00 |
| 2 | 1 | celebration | TRUE | 4 | No nos lo perderemos | 2023-05-10 15:32:00 |
| 3 | 3 | ceremony | FALSE | 0 | Lo siento, no podré asistir | 2023-05-11 10:15:00 |

### 3. Music Suggestions Sheet

This sheet stores music suggestions from invitees.

**Columns:**
- `id` (string): Unique identifier for each suggestion
- `inviteeId` (string): ID of the invitee (references the Invitees sheet)
- `songTitle` (string): Title of the suggested song
- `artist` (string): Artist name
- `comment` (string): Optional comment about the song
- `timestamp` (datetime): When the suggestion was submitted

Example:
| id | inviteeId | songTitle | artist | comment | timestamp |
|----|-----------|-----------|--------|---------|-----------|
| 1 | 1 | Perfect | Ed Sheeran | Es una canción romántica | 2023-05-10 15:35:00 |
| 2 | 2 | Thinking Out Loud | Ed Sheeran |  | 2023-05-11 09:20:00 |
| 3 | 3 | Can't Help Falling In Love | Elvis Presley | Un clásico | 2023-05-12 14:45:00 |

## Setting Up Google Sheets

1. Create three new Google Sheets with the column structures described above.
2. Name them appropriately (e.g., "Wedding Invitees", "Wedding Confirmations", "Wedding Music Suggestions").
3. Add the header row to each sheet as the first row.
4. Note the Sheet IDs for each sheet (found in the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`).

## Setting Up Google Apps Script

1. Open the Google Sheet containing your invitees.
2. Click on Extensions > Apps Script.
3. Delete any code in the editor and replace it with the code from `Code.gs` in the wedding app repository.
4. Create a new HTML file named `invitation_template.html` and copy the content from the repository.
5. Update the configuration in `Code.gs` with your Sheet IDs.
6. Deploy the script as a web app:
   - Click Deploy > New deployment
   - Select type: Web app
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click Deploy
   - Copy the Web app URL for use in the wedding app

## Connecting to the Wedding App

1. In the admin panel of the wedding app, go to the Settings tab.
2. Enter the Sheet IDs and the Apps Script URL in the appropriate fields.
3. Save the settings.

Now the wedding app will be connected to your Google Sheets for storing and retrieving data!

## Data Security Considerations

- The Google Apps Script web app is deployed with public access to allow the wedding website to interact with it.
- No sensitive data should be stored in these sheets beyond what is necessary for the invitation system.
- Consider using a Google account specifically for this project rather than your primary account.
- You may want to delete or restrict access to the web app after the wedding. 