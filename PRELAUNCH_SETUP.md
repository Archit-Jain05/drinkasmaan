# Prelaunch page setup

The prelaunch page is the store's password page. Visitors see it while the store is locked;
turn the password off (Online Store > Preferences) to launch the real site.

The form posts to the Google Apps Script web app in `templates/password.json` (`sheet_url`).

1. Open the Google Sheet, then Extensions > Apps Script.
2. Keep your existing `doPost`. Add this as its **first line**, before any `try`:
   `if (e.parameter.source === 'prelaunch-free-sample') return prelaunch(e.parameter);`
3. Paste everything in the code block below at the bottom of the file. If you already have a
   `doGet`, keep only one (the one below feeds the live counter).
4. Save, then Deploy > Manage deployments > pencil icon > New version > Deploy.
   The URL stays the same. Access must be "Anyone", execute as "Me".

```js
const TEAM = ['rbm299@gmail.com', 'drinkasmaan@gmail.com'];
const INSTAGRAM = 'https://www.instagram.com/drinkasmaan';
// Front of each can: Wild Magenta, Kala Jamun, Alphonso Mango. Served as PNG so every email app can show them.
const CANS = [
  'https://cdn.shopify.com/s/files/1/0808/2400/8936/files/01_featured_front_image.webp?v=1789322428',
  'https://cdn.shopify.com/s/files/1/0808/2400/8936/files/01_featured_front_image_d49a29a3-72dc-4aa7-a49f-4bd438390958.webp?v=1789322504',
  'https://cdn.shopify.com/s/files/1/0808/2400/8936/files/01_featured_front_image_9cc3ceb6-1495-47b1-88b1-b96bd5b9baea.webp?v=1789322526'
].map(u => u + '&format=png&width=240');

// Live counter on the prelaunch page: number of registrations (rows under the header).
function doGet() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Prelaunch');
  const count = sh ? Math.max(0, sh.getLastRow() - 1) : 0;
  return ContentService.createTextOutput(JSON.stringify({ count })).setMimeType(ContentService.MimeType.JSON);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
// Same, but keeps line breaks (for the multi-line address).
function escBr(s) {
  return esc(s).replace(/\n/g, '<br>');
}

function prelaunch(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Prelaunch') || ss.insertSheet('Prelaunch');
  if (sheet.getLastRow() === 0) sheet.appendRow(['Time', 'Name', 'Email', 'Address line 1', 'Address line 2', 'City', 'State', 'PIN code', 'Full address']);
  // All the address fields on one line, e.g. "12 Marine Drive, Flat 4B, Mumbai, Maharashtra 400020, India"
  const fullAddress = p.address1
    ? [p.address1, p.address2, p.city, [p.state, p.pincode].filter(Boolean).join(' '), 'India'].filter(Boolean).join(', ')
    : String(p.address || '').replace(/\n/g, ', ');
  sheet.appendRow([p.timestamp, p.name, p.email, p.address1 || p.address, p.address2 || '', p.city || '', p.state || '', p.pincode || '', fullAddress]);
  const n = sheet.getLastRow() - 1; // this person's registration number

  MailApp.sendEmail({
    to: TEAM.join(','),
    replyTo: p.email,
    subject: 'New free sample request #' + n + ': ' + p.name,
    htmlBody: teamHtml(p, n)
  });

  MailApp.sendEmail({
    to: p.email,
    name: 'Asmaan',
    replyTo: TEAM[1],
    subject: "Thank you for registering, " + String(p.name).split(' ')[0],
    body: 'Thank you, ' + p.name + '! We have your request for a free Asmaan sample. Our team will reach out to you soon.',
    htmlBody: confirmHtml(p, n)
  });

  return ContentService.createTextOutput('ok');
}

// Email to the team: plain and scannable.
function teamHtml(p, n) {
  const row = (k, v) => `<tr><td style="padding:10px 14px;color:#6b6b7a;width:110px;border-top:1px solid #eee">${k}</td><td style="padding:10px 14px;border-top:1px solid #eee"><b>${escBr(v)}</b></td></tr>`;
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#14121c">
    <div style="background:#1c1236;color:#fff;padding:18px 20px;border-radius:14px 14px 0 0">
      <div style="font-size:12px;letter-spacing:2px;color:#b8b0ee">NEW FREE SAMPLE REQUEST</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">#${n} &middot; ${esc(p.name)}</div>
    </div>
    <table style="border-collapse:collapse;width:100%;border:1px solid #eee;border-top:0;font-size:14px">
      ${row('Name', p.name)}${row('Email', p.email)}${row('Address', p.address)}${row('Received', p.timestamp)}    </table>
    <p style="font-size:12px;color:#8a8a98">Reply to this email to write to them directly.</p>
  </div>`;
}

// Email to the person who signed up: the night sky, a first-batch pass with their number on it.
function confirmHtml(p, n) {
  const first = esc(String(p.name).split(' ')[0]);
  const num = ('0000' + n).slice(-4);
  const step = (t, d) => `<tr><td valign="top" style="padding:0 14px 16px 0;width:14px"><div style="width:10px;height:10px;border-radius:5px;background:#9089d3;margin-top:6px"></div></td><td style="padding:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#e8e5f7"><b style="color:#ffffff">${t}</b><br>${d}</td></tr>`;
  const line = (k, v) => `<tr><td style="padding:9px 0;font-family:Georgia,serif;font-size:11px;letter-spacing:2px;color:#8d87b8;width:96px" valign="top">${k}</td><td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:21px;color:#ffffff" valign="top">${escBr(v)}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;padding:0;background:#07050f">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#07050f">Your spot is saved. Our team will reach out to you soon.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1c1236" style="background:#1c1236;background-image:linear-gradient(180deg,#07050f 0%,#1c1236 40%,#4a3d85 100%)">
<tr><td align="center" style="padding:40px 14px">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px">

    <tr><td align="center" style="padding-bottom:6px">
      <div style="font-family:'Arial Black',Arial,Helvetica,sans-serif;font-style:italic;font-weight:900;font-size:46px;line-height:46px;letter-spacing:-2px;color:#ffffff">ASMAAN</div>
      <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:5px;color:#9089d3;padding-top:8px">AMBITION TONIC</div>
    </td></tr>

    <tr><td align="center" style="padding:36px 8px 8px">
      <div style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:34px;line-height:38px;letter-spacing:-1px;color:#ffffff">Thank you for registering, ${first}.</div>
    </td></tr>

    <tr><td align="center" style="padding:18px 0 4px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        ${CANS.map(u => `<td align="center" width="33%" style="padding:0 4px"><img src="${u}" alt="Asmaan can" width="150" style="display:block;width:100%;max-width:150px;height:auto;border:0"></td>`).join('')}
      </tr></table>
    </td></tr>

    <tr><td align="center" style="padding:18px 8px 8px">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;color:#cfcaef">We saved you a spot in the first batch.<br><b style="color:#ffffff">Our team will reach out to you soon.</b></div>
    </td></tr>

    <tr><td style="padding:28px 0 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0c14" style="background:#0e0c14;border:1px solid #3a3266;border-radius:22px">
        <tr><td style="padding:24px 26px 6px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;color:#9089d3">FIRST BATCH PASS</td>
            <td align="right" style="font-family:'Arial Black',Arial,sans-serif;font-style:italic;font-weight:900;font-size:24px;letter-spacing:-1px;color:#ffffff">No. ${num}</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 26px"><div style="border-top:2px dashed #3a3266;height:1px;line-height:1px;font-size:1px">&nbsp;</div></td></tr>
        <tr><td style="padding:10px 26px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${line('NAME', p.name)}${line('EMAIL', p.email)}${line('DELIVER TO', p.address)}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:26px 6px 6px">
      <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:3px;color:#9089d3;padding-bottom:16px">WHAT HAPPENS NEXT</div>
      <table role="presentation" cellpadding="0" cellspacing="0">
        ${step('Your request is in', 'It reached our team the moment you sent it.')}
        ${step('We reach out', 'Someone from the Asmaan team will contact you to arrange your sample.')}
        ${step('Your can arrives', 'Cold, calm and ready to open.')}
      </table>
    </td></tr>

    <tr><td align="center" style="padding:14px 0 6px">
      <a href="${INSTAGRAM}" style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;letter-spacing:2px;padding:16px 34px;border-radius:999px">FOLLOW @DRINKASMAAN</a>
    </td></tr>

    <tr><td align="center" style="padding:34px 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8d87b8">
      You are getting this because you asked for a free sample on the Asmaan website.<br>
      Something look wrong? Just reply to this email.
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;
}
```
