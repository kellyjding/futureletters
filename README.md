# Future Self Letters

A simple form where teaching staff write a letter to their future self, submitted now and read back manually in December.

- `index.html` — the form. No build step; open it directly or host it anywhere static (GitHub Pages, Netlify, etc.).
- `apps-script/Code.gs` — receives submissions and appends them to a Google Sheet.

## Setup (one-time, ~5 minutes)

1. **Create a Google Sheet.** Go to [sheets.google.com](https://sheets.google.com), create a new blank sheet, name it something like "Future Self Letters".
2. **Open the script editor.** In the Sheet, go to `Extensions > Apps Script`.
3. **Paste the code.** Delete the placeholder content and paste in the contents of [`apps-script/Code.gs`](apps-script/Code.gs).
4. **Deploy as a web app.**
   - Click `Deploy > New deployment`.
   - Click the gear icon next to "Select type" and choose `Web app`.
   - Set "Execute as" to **Me**.
   - Set "Who has access" to **Anyone**.
   - Click `Deploy`. Authorize the script when prompted (it's your own script, so this is safe).
   - Copy the **Web app URL** it gives you.
5. **Wire up the form.** Open `index.html`, find this line near the bottom:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   and replace it with the URL you just copied.
6. **Set the delivery date.** Just above that, edit:
   ```js
   const DELIVERY_DATE_LABEL = "December 19, 2026";
   ```
   to whatever date you want displayed to staff.
7. **Host the form.** Easiest options:
   - Open `index.html` locally and share the file, or
   - Push this folder to a GitHub repo and turn on GitHub Pages, or
   - Drag the folder into [Netlify Drop](https://app.netlify.com/drop) for an instant public URL.

## Sending letters automatically in December

`Code.gs` now includes `sendScheduledLetters()`, which emails each unsent row back to its author and marks it "yes" in the "Sent?" column. Wire it up once and forget about it:

1. **Set the send date.** At the top of `Code.gs`:
   ```js
   const SEND_ON_DATE = new Date('2026-12-19');
   ```
   Update the date, then re-paste/save the script in the Apps Script editor (`Deploy > Manage deployments` isn't needed for this — trigger functions run from the latest saved code automatically).
2. **Add a daily trigger.**
   - In the Apps Script editor, click the clock icon (**Triggers**) in the left sidebar.
   - Click `+ Add Trigger`.
   - Choose function: `sendScheduledLetters`.
   - Event source: **Time-driven**.
   - Type of time-based trigger: **Day timer**, pick any time (e.g. midnight to 1am).
   - Save, and authorize if prompted (it needs permission to send email as you).

That's it. The trigger runs daily but `sendScheduledLetters()` is a no-op until today reaches `SEND_ON_DATE`, and it skips rows already marked "yes" — so it's safe to set this up any time before December, and safe if it runs a day or two late.

Each email is sent from your Google account (via `MailApp`), with the letter's own text as the body, straight to the address the person submitted. Double-check a test row's email works by manually running `sendScheduledLetters` from the Apps Script editor with a past `SEND_ON_DATE`, or by adding a one-off test row.

**Limits:** `MailApp` caps daily sends at 100/day for a personal Gmail account, 1,500/day for Google Workspace — plenty for a teaching staff.

## Notes

- The form has no authentication — anyone with the link can submit. Fine for a small trusted staff group; don't share the link publicly.
- The "Delivery Date" column in the Sheet is just the label shown to the person when they submitted — the actual send date is controlled solely by `SEND_ON_DATE` in the script.
