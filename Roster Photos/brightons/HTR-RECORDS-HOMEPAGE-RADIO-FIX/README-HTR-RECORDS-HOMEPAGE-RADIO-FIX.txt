HTR Records Homepage Radio Fix

This fixes ONLY the HelloTexasRecords.com bottom/random HTR Radio player.

Replace:
D:\hello-texas-records\homepage-app.js
D:\HTR-Control-Center\scripts\build-radio-data.py

Then run:
HTR-MENU.bat -> Rebuild Radio Data
HTR-MENU.bat -> Publish HelloTexasRecords.com Repo

What changed:
- homepage-app.js now accepts coverImage, cover, albumCover, albumArt, or image.
- homepage-app.js updates the top radio art and bottom player art.
- bottom player prev/play/next controls are wired.
- missing optional elements no longer crash the whole radio script.
- build-radio-data.py writes all compatible cover/audio fields.
- This does NOT touch hellotexasradio.com or the FM dial system.
