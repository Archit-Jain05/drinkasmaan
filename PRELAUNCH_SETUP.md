# Prelaunch page setup

The prelaunch page is the store's password page. Visitors see it while the store is locked;
turn the password off (Online Store > Preferences) to launch the real site.

The form posts to the Google Apps Script web app in `templates/password.json` (`sheet_url`).
Add the code below to the Apps Script project, then Deploy > Manage deployments > Edit > New version
(the URL stays the same). This URL is shared with the ambassador form, so keep your existing `doPost`
and put one line at its top: `if (e.parameter.source === 'prelaunch-free-sample') return prelaunch(e.parameter);`
The code below already has the `prelaunch(p)` function and the `doGet` that feeds the live counter.

```js
function doGet() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Prelaunch');
  const count = sh ? Math.max(0, sh.getLastRow() - 1) : 0; // minus header row
  return ContentService.createTextOutput(JSON.stringify({ count })).setMimeType(ContentService.MimeType.JSON);
}

const TEAM = ['rbm299@gmail.com', 'drinkasmaan@gmail.com'];

function prelaunch(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Prelaunch') || ss.insertSheet('Prelaunch');
  if (sheet.getLastRow() === 0) sheet.appendRow(['Time', 'Name', 'Email', 'Address']);
  sheet.appendRow([p.timestamp, p.name, p.email, p.address]);

  const esc = s => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const row = (k, v) => `<tr><td style="padding:8px 12px;color:#666">${k}</td><td style="padding:8px 12px"><b>${esc(v)}</b></td></tr>`;

  MailApp.sendEmail({
    to: TEAM.join(','),
    replyTo: p.email,
    subject: 'New free sample request: ' + p.name,
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px">
      <h2 style="margin:0 0 12px">New free sample request</h2>
      <table style="border-collapse:collapse;border:1px solid #e5e5e5;width:100%">
        ${row('Name', p.name)}${row('Email', p.email)}${row('Address', p.address)}${row('Received', p.timestamp)}
      </table></div>`
  });

  MailApp.sendEmail({
    to: p.email,
    name: 'Asmaan',
    replyTo: 'drinkasmaan@gmail.com',
    subject: 'We got your Asmaan sample request',
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px">
      <h2>Thank you, ${esc(p.name)}!</h2>
      <p>We have your request for a free Asmaan sample. Our team will reach out to you soon.</p>
      <p>Asmaan</p></div>`
  });

  return ContentService.createTextOutput('ok');
}
```
