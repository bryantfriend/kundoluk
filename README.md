# Kundoluk Teacher Companion

Free English interface guidance and local Excel lesson plans for teachers using Kundoluk. Version 0.12.1.

Independent, unofficial extension. Not affiliated with or endorsed by Kundoluk or the Ministry of Education. Chrome Web Store submission is being prepared; a store link will be added after approval.

## Features

- Translate recognized Kyrgyz and Russian interface labels into English, with contextual help.
- Import supported .xlsx lesson plans and keep multiple workbooks locally.
- Assign worksheets to classes and subjects.
- Preview exact topic/homework text, then fill the current lesson after checking the subject, class and date.
- Suggest sessions using teacher-confirmed progress or explicitly captured schedules.
- Move and resize the companion window; use Manage classes for curriculum setup.

The extension never presses Save and does not enter grades or attendance. Unknown labels remain original. Site changes and incomplete schedules require teacher review. Student access help explains labels; it does not reset credentials.

## Install for trusted development testing

1. Download this repository using Code > Download ZIP and extract it to a folder you will keep.
2. Open `chrome://extensions` in Chrome.
3. Enable Developer mode and select Load unpacked.
4. Choose the extracted project's `extension` folder, which contains `manifest.json`.
5. Log into your authorized Kundoluk teacher account and refresh the teacher portal.
6. Open a lesson and click Lesson companion. Use Manage classes to import and assign a workbook.
7. Review the selected class, subject, date and exact source text before filling. Review the native form and save it yourself.

For a new version, replace the extension files in the same folder, click Reload on its extension card, and refresh Kundoluk. Developer installations do not update automatically. Keep original workbooks as backups.

## Workbook format

Use the headers `№ урока`, `Количество уроков`, `План урока`, `Домашнее задание`. Each row is a lesson block. A positive whole session count repeats the same text across its selected sessions. Text and line breaks are preserved; rich-text styling is not transferred.

Use text-based .xlsx files under 15 MB, up to 10,000 rows and 100 sessions per lesson. Formulas, merged cells and Excel error values are unsupported. No macros or external links execute. Empty homework cells preserve existing homework; replacing nonempty destination text requires explicit permission in the panel.

## Privacy

The extension runs only at `https://kundoluk.edu.gov.kg/mon*`. Workbooks, class assignments, captured schedules, teacher-confirmed progress and preferences stay in local Chrome extension storage. No analytics, ads, remote translation service or developer server. No password or cookie reading, student exports, grading or attendance entry.

See [Privacy Policy](PRIVACY.md). Clearing extension storage or uninstalling removes local saved plans. The extension does not sync or back them up.

## Checks and demo

Run each `tests/*.cjs` file with Node.js from the repository root. The existing nine scripts cover workbook templates, library behavior, progress, context recognition, labels, student-access label handling, event boundaries, timetable cards and window geometry. `release/browser-validation.txt` records the full-script synthetic lesson check. These checks do not prove production server persistence.

Open `release/demo.html` in a browser to view a synthetic lesson with demo-only local storage. It has no connection to school records. The optional screenshot helper requires Playwright and a local Chromium installation. Private workbook fixtures are not included.

## Support and credits

Report problems through [Issues](https://github.com/bryantfriend/kundoluk/issues). Use synthetic examples; never post student names, passwords, account identifiers or private workbooks.

JSZip is bundled locally under its [MIT license](extension/vendor/JSZIP-LICENSE.md). All extension code is packaged locally.
