# Connect Daily / Weekly — automation kit

This kit reproduces the **exact branded brief** we built (Connect logo, Josefin Sans + Inter,
coloured section chips, boxes, diary strip, sources table) from a simple content file — so a
scheduled run can regenerate it every day/week without redesigning anything.

The idea: a **Claude Code Desktop scheduled routine** runs each morning, gathers the latest
news, writes a `content_*.json`, runs the build, and emails you the finished PDF to check and forward.

---

## What's in here
- `build.js` — turns a content JSON into the branded `.docx`
- `make.sh` — runs `build.js` then converts to PDF → `out/`
- `setup.sh` — one-time: installs the brand fonts + the `docx` library
- `content_daily.json`, `content_weekly.json` — **sample** content (also the schema by example)
- `assets/` — MAPs + Connect logos and the brand fonts

---

## One-time setup (do once)
From inside this folder:
```
bash setup.sh
```
This installs the fonts and the `docx` library. PDF conversion needs **LibreOffice** (the `soffice`
command) and **Node.js** — Code Desktop can install these for you if they're missing:
- macOS: `brew install --cask libreoffice`
- Ubuntu: `sudo apt-get install libreoffice`

Test it works:
```
bash make.sh content_weekly.json weekly
```
→ prints the path to a finished PDF in `out/`. Open it; it should match the branded brief exactly.

---

## Set up the schedule (Claude Code Desktop)
1. In the desktop app, open **Code** and create a project pointing at **this folder**.
2. Open the **Routines** page → **New routine** (one for daily, one for weekly).
3. Paste the matching prompt below as the routine's instruction.
4. Set the cadence: **Daily → every weekday, 07:00**; **Weekly → Fridays, 07:00**.
5. Choose **remote routine** if you want it to run even when your computer is off; otherwise a
   local task runs while the app is open.

> Tip: run each routine once manually first to confirm the output before letting it run on schedule.

---

## Routine prompt — CONNECT DAILY
```
You are producing today's "Connect Daily" briefing for Andy Marsden, Sector Inclusion Lead
for the MAPs programme (Sheffield secondary schools). Work in this project folder.

1. Using web search, find UK education news published in the LAST 24–48 HOURS across:
   national policy/DfE/legislation; inclusion, SEND & alternative provision; behaviour,
   exclusions, suspensions & attendance; Ofsted & accountability; safeguarding & wellbeing;
   funding. Plus Sheffield / South Yorkshire. Favour official and evidence sources (GOV.UK,
   DfE press releases & news announcements, BBC News Education, Ofsted, Explore Education
   Statistics, Commons Library, EEF, NFER, EPI, IFS, FFT Datalab, The Difference, IPPR,
   Youth Endowment Fund, Schools Week, Tes, Guardian Education; local: The Star, Sheffield
   City Council, South Yorkshire MCA). Corroborate anything from social media against a
   primary source before using it.

2. Write the results into content_daily.json following EXACTLY the structure of the existing
   content_daily.json in this folder (keys: edition [leave ""], date [today, e.g. "Wednesday 6
   August 2026"], topline [max 4, each {text, action?}], diary [{date,color,text}], sections
   [{heading,color,items:[{lede,body,source,url,action?}]}], box [one of the types below]).
   Colours to use: purple, magenta, indigo, amber, coral, teal, grey.
   Box options: {"type":"datapoint","big":"…","text":"…","attribution":"…"} OR
   {"type":"jargon","label":"Jargon-buster — …","intro":"…","text":"…"} OR
   {"type":"corridor","quote":"…","author":"…"}.

3. Target a ~60-second read (roughly 250–350 words of content total). Where something genuinely
   moved, aim to cover 4–6 beats rather than just 2–3 — a school leader should get a real
   scan of the day, not just the single biggest story. Each item can run to 1–2 sentences of
   context rather than a bare headline.

4. Rules: ONLY include items genuinely new in the last 1–2 days. If it's a quiet day, keep it
   short and say so — do not pad with old or minor news to hit a length target. Every url must
   be a REAL link from your search results — never invent links or figures. Keep quotes under
   15 words. Flag any uncertain figure.

5. Run:  bash make.sh content_daily.json daily
   Then email the resulting PDF in out/ to me at amarsden1510@gmail.com, subject
   "Connect Daily — [today's date]", body: one-line summary of the top item. Do not send
   anywhere else. If email sending isn't available, save the PDF and tell me where it is.
```

## Routine prompt — CONNECT WEEKLY
```
Same as above, but produce "Connect Weekly": review the LAST 7 DAYS, aim for fuller coverage
across all beats — target 6–8 sections, not a trimmed-down version of the daily. Target a ~5
minute read (roughly 1,000–1,400 words of content total): go into more analytical depth per
item — 2–3 sentences of context, how it connects to other stories this week, and the practical
implication for schools — rather than a headline-plus-link summary. Write
content_weekly.json (set edition to the next issue number, date to "week ending [Friday's
date]"), give each top-line item an action line, populate the diary with upcoming dated
deadlines, and include one rotating box. Then run:
   bash make.sh content_weekly.json weekly
and email the PDF in out/ to me at amarsden1510@gmail.com, subject "Connect Weekly — week ending [date]".
```

---

## The email step
The routine emails the PDF to you via your connected **Gmail**. If attaching files isn't
supported by the connector, the routine will save the PDF to `out/` and tell you the path —
you attach it manually. Keep it sending to **you only** for now; you check and forward on.

## Content schema (quick reference)
See `content_weekly.json` for a full worked example. Only the content changes each run — the
masthead, sources table, School+ box and footer are fixed in `build.js`, so branding stays
identical automatically.
