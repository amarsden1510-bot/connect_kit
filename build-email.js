/*
 * Connect brief EMAIL builder — renders the same branded design as build.js,
 * but as inline-styled, table-based HTML suitable for pasting into an email's
 * htmlBody (works in Gmail/Outlook/Apple Mail without attachments or custom fonts).
 *
 * Usage:  node build-email.js <content.json> <daily|weekly>
 * Output: out/<name>.html  (prints the path; read the file and use its
 *         contents as the Gmail send_message htmlBody)
 *
 * Images (logo/icon) are referenced via their raw GitHub URL rather than
 * embedded, so this only works once content_daily.json/content_weekly.json
 * and assets/ are pushed to the repo (they already are).
 */
const fs = require('fs');
const path = require('path');

const contentPath = process.argv[2] || 'content_daily.json';
const type = (process.argv[3] || 'daily').toLowerCase();
const C = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Same brand constants as build.js
const PURPLE='#3B2176', MAGENTA='#E5298E', INDIGO='#534AB7', AMBER='#F6B642',
      CORAL='#D85A30', TEAL='#1D9E75', GREY='#5A5566', DARK='#241540';
const LILAC='#F1ECFA', JFILL='#EBEAF8', DFILL='#E4F3EC', CFILL='#FBF3E6', MFILL='#FCE7F1';
const HEAD="'Josefin Sans','Century Gothic','Trebuchet MS',sans-serif";
const BODY="'Inter',Arial,Helvetica,sans-serif";
const COLORS={purple:PURPLE,magenta:MAGENTA,indigo:INDIGO,amber:AMBER,coral:CORAL,teal:TEAL,grey:GREY};
const col=(n)=>COLORS[(n||'').toLowerCase()]||PURPLE;

// Raw GitHub URLs for the two brand images (repo is pushed; update the
// owner/repo/branch below if the repo ever moves).
const REPO_RAW = 'https://raw.githubusercontent.com/amarsden1510-bot/connect_kit/main';
const ICON_URL = REPO_RAW + '/assets/CONNECT_ICON_HR.png';
const LOGO_URL = REPO_RAW + '/assets/MapsLogo.jpg';

const esc = (s) => String(s ?? '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function link(label, url) {
  return `<a href="${esc(url)}" style="color:${INDIGO};text-decoration:underline;font-family:${BODY};">${esc(label)}</a>`;
}

function item(lede, body, srcLabel, srcUrl, accent) {
  let html = `<span style="color:${accent};">&#9642;</span> `;
  if (lede) html += `<b style="color:${DARK};">${esc(lede)}</b> `;
  if (body) html += `<span style="color:#2E2740;">${esc(body)}</span> `;
  if (srcLabel) html += `<span style="color:${GREY};">(${link(srcLabel, srcUrl)})</span>`;
  return `<tr><td style="padding:0 0 8px 14px;font-family:${BODY};font-size:14px;line-height:1.5;">${html}</td></tr>`;
}

function actionLine(text) {
  return `<tr><td style="padding:0 0 14px 24px;font-family:${BODY};font-size:13px;line-height:1.5;">
    <b style="color:${MAGENTA};">&#8594; For your school: </b>
    <i style="color:#4A4360;">${esc(text)}</i></td></tr>`;
}

function box(label, accent, fill, rowsHtml) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
    <tr>
      <td width="4" bgcolor="${accent}" style="font-size:1px;line-height:1px;">&nbsp;</td>
      <td bgcolor="${fill}" style="padding:14px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:0 0 8px 0;font-family:${HEAD};font-size:13px;font-weight:bold;letter-spacing:1px;color:${accent};text-transform:uppercase;">${esc(label)}</td></tr>
          ${rowsHtml}
        </table>
      </td>
    </tr>
  </table>`;
}

function sectionHeading(text, color) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 8px 0;border-bottom:2px solid ${color};">
    <tr><td style="padding:0 0 6px 0;font-family:${HEAD};font-size:16px;font-weight:bold;letter-spacing:1px;color:${color};text-transform:uppercase;">
      <span style="color:${color};">&#9632;</span> ${esc(text)}
    </td></tr>
  </table>`;
}

function rotating(bx) {
  if (!bx) return '';
  if (bx.type === 'datapoint') return box(bx.label || 'Data point', TEAL, DFILL, `
    <tr><td style="padding:0 0 4px 0;font-family:${HEAD};font-size:28px;font-weight:bold;color:${TEAL};">${esc(bx.big||'')}</td></tr>
    <tr><td style="padding:0 0 8px 0;font-family:${BODY};font-size:14px;color:#2E2740;">${esc(bx.text||'')}</td></tr>
    <tr><td style="font-family:${BODY};font-size:12px;font-style:italic;color:${GREY};">${esc(bx.attribution||'')}</td></tr>`);
  if (bx.type === 'jargon') return box(bx.label || 'Jargon-buster', INDIGO, JFILL, `
    <tr><td style="padding:0 0 8px 0;font-family:${BODY};font-size:13px;color:#2E2740;">${esc(bx.intro||'')}</td></tr>
    <tr><td style="font-family:${BODY};font-size:13px;color:#2E2740;">${esc(bx.text||'')}</td></tr>`);
  if (bx.type === 'corridor') return box(bx.label || 'From the corridor', AMBER, CFILL, `
    <tr><td style="padding:0 0 6px 0;font-family:${BODY};font-size:14px;font-style:italic;color:#2E2740;">${esc(bx.quote||'')}</td></tr>
    <tr><td style="font-family:${BODY};font-size:12px;color:${GREY};">${esc(bx.author||'')}</td></tr>`);
  return '';
}

let out = [];
out.push(`<div style="max-width:640px;margin:0 auto;font-family:${BODY};background:#FFFFFF;">`);

// Masthead
out.push(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
  <tr>
    <td width="56" valign="middle"><img src="${ICON_URL}" width="44" height="44" alt="" style="display:block;"></td>
    <td valign="middle" style="font-family:${HEAD};font-size:26px;font-weight:bold;letter-spacing:1px;color:${PURPLE};">
      ${type === 'weekly' ? 'CONNECT WEEKLY' : 'CONNECT DAILY'}
    </td>
    <td valign="middle" align="right">
      <img src="${LOGO_URL}" width="90" alt="" style="display:block;margin-left:auto;"><br>
      <span style="font-family:${BODY};font-size:12px;color:${GREY};font-weight:bold;">
        ${C.edition ? esc(C.edition) + ' &middot; ' : ''}${esc(C.date)}
      </span><br>
      <span style="font-family:${BODY};font-size:11px;">${link('themapsproject.com','https://www.themapsproject.com')}</span>
    </td>
  </tr>
</table>`);

// Colour band
const BAND=[PURPLE,MAGENTA,INDIGO,AMBER,CORAL,TEAL,GREY];
out.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>`);
BAND.forEach(c => out.push(`<td bgcolor="${c}" style="font-size:1px;line-height:5px;">&nbsp;</td>`));
out.push(`</tr></table>`);

// Standfirst
const standfirst = C.standfirst || (type === 'weekly'
  ? 'A weekly review of national and South Yorkshire developments in education policy, inclusion, SEND, behaviour and accountability.'
  : 'A daily scan of national and South Yorkshire developments in education policy, inclusion, SEND, behaviour and accountability.');
out.push(`<p style="font-family:${BODY};font-size:13px;font-style:italic;color:${GREY};margin:0 0 12px 0;">${esc(standfirst)}</p>`);

// Top line
if (C.topline && C.topline.length) {
  let rows = '';
  C.topline.forEach(t => {
    rows += `<tr><td style="padding:0 0 6px 0;font-family:${BODY};font-size:14px;color:${DARK};">&#9642; ${esc(t.text)}</td></tr>`;
    if (t.action) rows += `<tr><td style="padding:0 0 10px 20px;font-family:${BODY};font-size:13px;">
      <b style="color:${MAGENTA};">&#8594; For your school: </b><i style="color:#4A4360;">${esc(t.action)}</i></td></tr>`;
  });
  out.push(box('Top line', MAGENTA, LILAC, rows));
}

// Diary
if (C.diary && C.diary.length) {
  let rows = '';
  C.diary.forEach(d => {
    rows += `<tr><td style="padding:0 0 6px 0;font-family:${BODY};font-size:13px;">
      <b style="color:${col(d.color)};">${esc(d.date)}</b>
      <span style="color:#2E2740;"> &mdash; ${esc(d.text)}</span></td></tr>`;
  });
  out.push(box('Dates for the diary', PURPLE, LILAC, rows));
}

// Sections
(C.sections || []).forEach(sec => {
  const accent = col(sec.color);
  out.push(sectionHeading(sec.heading, accent));
  out.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">`);
  (sec.items || []).forEach(it => {
    out.push(item(it.lede, it.body, it.source, it.url, accent));
    if (it.action) out.push(actionLine(it.action));
  });
  out.push(`</table>`);
});

// Rotating box
out.push(rotating(C.box));

// Footer
out.push(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-top:2px solid ${PURPLE};">
  <tr><td style="padding:10px 0 2px 0;font-family:${BODY};font-size:13px;">
    <b style="color:${PURPLE};">${type === 'weekly' ? 'Connect Weekly' : 'Connect Daily'}</b>
    <span style="color:${GREY};"> is part of Sheffield Connect. Compiled by Andy Marsden, Sector Inclusion Lead.</span>
  </td></tr>
  <tr><td style="font-family:${BODY};font-size:11px;font-style:italic;color:#8A8496;">
    For circulation across the network and partners. Figures reflect the latest published data at the date of this brief.
  </td></tr>
</table>`);

out.push(`</div>`);

const html = out.join('\n');
const safe = (type === 'weekly' ? 'Connect_Weekly' : 'Connect_Daily') + '_' + (C.date || '').replace(/[^A-Za-z0-9]+/g, '_');
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, safe + '.html');
fs.writeFileSync(outPath, html);
console.log(outPath);
