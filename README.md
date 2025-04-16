# Wedding Invitation System

A beautiful, dynamic wedding invitation system with Google Sheets integration for managing invitees, confirmations, and more.

## Features

- 🌟 Beautiful, responsive invitation design
- 📱 Mobile-friendly interface
- 🔄 Dynamic invitation generation
- 📊 Google Sheets integration
- 📝 RSVP management system
- 🎵 Music suggestion collection
- 🎁 Gift registry and honeymoon fund information
- 📅 Calendar integration
- 🗺️ Location maps and directions
- 🖨️ PDF invitation generation

## Project Structure

- `deluxe/`: The main invitation design template
  - `index.html`: Entry page with music options
  - `invitation.html`: Main invitation page
  - `css/`: Stylesheets
  - `js/`: JavaScript files
  - `images/`: Image assets
  - `admin/`: Admin panel for managing invitations
  - `google-apps-script/`: Scripts for Google Sheets integration
  - `google-sheets-templates/`: Templates for setting up Google Sheets

## Setup Instructions

### Prerequisites

- A web server to host the files (or use GitHub Pages)
- A Google account for Google Sheets integration

### Installation

1. Clone or download this repository
2. Upload the files to your web server
3. Follow the instructions in `deluxe/google-sheets-templates/README.md` to set up Google Sheets
4. Open the admin panel by navigating to `/admin/` on your website
5. Configure your wedding details in the admin panel

### Google Sheets Integration

This system uses Google Sheets to store and manage:
- Invitee information
- Confirmation responses
- Music suggestions

The integration is done via Google Apps Script. Detailed setup instructions are provided in the `google-sheets-templates` directory.

## Customization

### Colors and Design

You can customize the colors, fonts, and other design elements in the admin panel's "Invitation Design" section.

### Wedding Details

Configure all your wedding details including:
- Couple's names
- Wedding date and times
- Ceremony and celebration locations
- Honeymoon fund information

### Text Content

All text content is easily editable through the admin panel or by directly modifying the HTML files.

## Generating Invitations

1. Add your invitees in the admin panel
2. Each invitee will have a unique ID
3. Generate a personalized invitation link for each invitee
4. Optionally, generate PDF versions of invitations

## Invitation Link Format

```
https://your-website.com/invite?id=[INVITEE_ID]
```

## PDF Generation

The system can generate PDF versions of invitations using Google Apps Script. This is useful for:
- Sending physical invitations
- Providing offline copies
- Sharing on messaging apps

## Contact and Support

For questions, issues, or custom development requests, please contact wugalde19@gmail.com.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 