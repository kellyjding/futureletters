// Paste this into the Apps Script editor for the Google Sheet
// that will collect the letters (Extensions > Apps Script).

const SHEET_NAME = 'Letters';

// The day letters should go out. Change the date, then re-save.
const SEND_ON_DATE = new Date('2026-12-19');
const EMAIL_SUBJECT = 'A letter from your past self';

function doGet(e) {
  return ContentService
    .createTextOutput('Future Self Letters script is deployed and reachable. Submissions come in via POST from the form, not this page.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const params = e.parameter;

  sheet.appendRow([
    new Date(),
    params.email || '',
    params.deliveryDate || '',
    params.letter || '',
    'no'  // "Sent?" column — mark "yes" once you've emailed it back
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Email', 'Delivery Date', 'Letter', 'Sent?']);
  }
  return sheet;
}

// Hook this up to a daily time-driven trigger (see README).
// It's a no-op until today reaches SEND_ON_DATE, and it skips any row
// already marked "yes" — so it's safe to run every day without
// double-sending, whether the trigger starts weeks early or catches up late.
function sendScheduledLetters() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < SEND_ON_DATE) return;

  const sheet = getOrCreateSheet_();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const [, email, , letter, sent] = rows[i];
    if (sent === 'yes' || !email || !letter) continue;

    MailApp.sendEmail({
      to: email,
      subject: EMAIL_SUBJECT,
      body: letter
    });

    sheet.getRange(i + 1, 5).setValue('yes');
  }
}
