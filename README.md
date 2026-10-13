# Kundoluk Teacher Companion

Free in version 0.12.1. Independent, unofficial extension; not affiliated with or endorsed by Kundoluk or the Ministry of Education. Chrome Web Store submission is in preparation.

See [privacy policy](PRIVACY.md). Report problems through this repository's Issues without posting student data, credentials or private workbooks.

## Student access help (0.2.0)

Expand **Student access — PIN / password help** in the companion. **Translate visible access controls** explains recognized Russian/Kyrgyz labels without reading input values or clicking reset buttons. It distinguishes a personal identification number from a login password and leaves credential entry and submission to the teacher. The account-specific student reset route still needs live verification; this release is a translation guide, not an automatic reset feature.

Run `node tests/student-access.cjs` for the label-only reader check.

Chrome Manifest V3 extension providing an English panel on Kundoluk. Version 0.1 imports lesson plans, previews the current class/date/subject, and fills the topic/homework form. It never presses Save and does not enter grades or attendance.

## Install locally

1. In Chrome, open `chrome://extensions`.
2. Enable **Developer mode**, choose **Load unpacked**, and select `D:\Kundoluk\extension`.
3. Log into Kundoluk in Chrome and refresh its page.
4. Open a lesson journal. Click **Lesson companion** at the bottom right.
5. Import your `.xlsx`, select its worksheet, lesson block and session, and review the subject/class/date.
6. Confirm the destination and click **Fill current lesson — do not save**.
7. Review the original Kundoluk form. Use its Save button yourself when ready, or Cancel to discard.

After extension updates, click Reload on its Chrome extension card, then refresh Kundoluk.

## Workbook format

Use the exact headers `№ урока`, `Количество уроков`, `План урока`, `Домашнее задание`. Each row is a lesson block. Text and line breaks are preserved, without translation, prefixes, session labels, trimming, or summarization. Excel rich-text styling is not transferred to Kundoluk's plain-text fields.

`Количество уроков` is a positive whole session count. A three-session block offers Session 1/3, 2/3, and 3/3 with the same source text. Select the appropriate real lesson date for each session; the extension does not invent dates, divide text, automatically advance, or claim a session has been saved. It can be reused for different classes.

An empty homework cell leaves existing homework unchanged. To change nonempty destination content, explicitly select Allow replacing. Any supplied homework block is preserved exactly. Whitespace-only homework is treated as supplied text.

Text-based `.xlsx` files only, under 15 MB, with at most 10,000 rows and 100 sessions per lesson. Formulas, merged cells, and Excel error values are rejected with an explanation. Convert formulas to values and unmerge before importing. No external links or macros are executed.

## Privacy and scope

Only runs at `https://kundoluk.edu.gov.kg/mon*`. Requests local extension storage to retain imported lesson blocks. No server, network requests, API key, cookie access, student exports, or password access. **Forget imported workbook** clears its local stored plan. Workbook contents are treated as text, never HTML or executable instructions.

The supplied Biology workbook is not bundled into the extension or committed. Import it locally. Match Biology plans to Biology lessons; the previously inspected journal is Geography.

## Validation

See `tests/` for a local browser harness using synthetic lesson forms. This tests exact import, multiline text, blank homework preservation, multiple sessions, context changes, overwrite protection, and no automatic save. Live persistence is intentionally untested until a real submission is authorized.

DOM mappings were inspected on the live Kyrgyz interface. Russian aliases are included where applicable but are not yet verified. Missing or ambiguous controls stop filling rather than guessing. Site changes may require adapter updates.

JSZip is vendored under its MIT license in `extension/vendor/`. All extension scripts are bundled locally.

## Saved workbooks
Version 0.3.0 retains each new import in a Saved workbooks library in this Chrome profile. The previously stored workbook is migrated automatically. Older overwritten imports must be imported again once. Remove selected saved workbook affects only that workbook. Plans are not synced between devices; uninstalling the extension or clearing extension storage removes them. Keep the original Excel files as backups. Storage errors leave existing plans intact. Reload the extension and refresh Kundoluk to activate the update.

## Lesson progress (0.4.0)
Open a lesson card and choose its workbook/worksheet. Select the correct starting lesson/session and click Plan selected lesson. Later dates suggest the next session after the most recent recorded date, separately per subject/class/school year. Use Select suggested lesson to apply it. After saving and reopening the native Kundoluk lesson, verify the text and use Record as posted. These are local teacher-confirmed records, not server-verified status. Filling never advances posted progress. Recorded dates are listed in the panel; Clear this date's record corrects mistakes. Unknown history, skipped dates, timetable changes and cancelled lessons require teacher review. No historical or weekly schedule scan is implemented.

## Schedule-based suggestions (0.5.0)
Select the intended workbook/worksheet, open a lesson and its native topics/homework list for the full school year, then click Use displayed dates as this class's schedule. The first listed teaching date maps to lesson 1/session 1. Each chronological date consumes one session, including multi-session blocks. Captures are stored per subject/class/school year and bound to that workbook/worksheet. Captured schedules take priority over manual progress. Duplicate dates require manual selection because this list does not identify periods. Dates absent from the capture are not guessed; refresh the capture as dates are added. Saved topics are displayed separately and are never treated as proof the planned curriculum was taught. Verify the first displayed date is complete; historical dates omitted by Kundoluk cannot be reconstructed. No school records are submitted by this feature.

## Class library (0.6.0)
My classes and lesson plans lists persistent subject/class assignments by school year. Scan the visible weekly timetable, scan additional weeks as needed, or add exact subject/class names manually. Opening a lesson also registers that class. Assign a saved workbook and worksheet or upload directly; uploads initially assign the first worksheet. On file indicates an existing locally saved workbook/worksheet, not a posted school record. Missing or removed workbooks show Needs a lesson plan. Opening an assigned lesson selects that workbook/worksheet when available. Storage is local to this Chrome profile, not a cloud backup. Timetable recognition needs live verification; manual addition is available if the site layout differs.

## English menus (0.7.0)
English menus are enabled by default with a persistent toggle in the companion. Known Kyrgyz/Russian navigation and action labels are translated as menus appear; hover shows the source label. Unknown labels remain in their original language. Lesson content, input values, names and grades are excluded. The adapter reads original button text to preserve filling behavior. Translations run locally with no translation service.

## Expanded UI translation and help (0.8.0)
Translates known page headings, table column headers, grouping instructions, summary counts and option labels alongside menus. Question-mark buttons open keyboard-accessible English dialogs for common fields and teacher workflows; Escape or Close dismisses them. The help layer is separate from native controls. Input values and free-text records are preserved. Unknown labels remain original; full coverage of unvisited pages is not verified. Adapter and schedule capture use original text even when headings are translated.

## Teaching workflow help (0.9.0)
Adds observed Russian variants for timetable, curriculum, quarter/year marks, grade-entry dialogs, student headings and Cancel. Direct plain-text layout labels now translate, including weekday headers, while record cells and info values remain excluded. More help covers topic/homework, date/period, assessment categories, choosing marks, reviewing student rows, Save all and attendance codes. The meaning of Инф remains explicitly unverified. Screenshot label tests pass; live layout and full-site coverage still require verification.

## Focused lesson view (0.11.0)
Opening Lesson companion on a lesson-detail page now shows the current subject/class/date, assigned curriculum, lesson/session choices and exact topic/homework previews. Setup menus and the full progress panel are hidden in this view. Manage classes opens the full setup; Back to current lesson restores the compact view. Missing assignments show a setup message instead of another class's workbook. The Use suggested lesson shortcut delegates to the existing progress suggestion. On timetable pages the full companion remains available.

## Modal interaction isolation (0.12.1)
The companion stops its pointer, mouse, touch, keyboard and focus events at the shadow boundary after its own handlers run. This prevents those interactions from reaching document-level bubbling outside-click handlers. Native text selection, copy/paste, upload controls and dragging retain their default behavior. Does not save or modify the native modal contents. Live Kundoluk dismissal behavior still requires verification.