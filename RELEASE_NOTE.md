# Release Note - v0.3.0 (Security Hardening & Code Quality)

## Security Fixes
- **CORS Restriction**: Replaced wildcard `allow_origins=["*"]` with an environment-variable-driven allowlist, defaulting to `http://localhost:3000`. Configure via `ALLOWED_ORIGINS` (comma-separated) for production deployments.
- **SSRF Protection**: Added strict URL validation on the `/analyze-url` endpoint — only `http`/`https` schemes are accepted, and requests to `localhost`, loopback addresses (`127.x`), and private IP ranges (`10.x`, `192.168.x`, `169.254.x`) are blocked.
- **File Size Limits**: Enforced a 100 MB cap on both direct uploads and URL-downloaded files to prevent resource exhaustion.

## Bug Fixes
- **Broken Unit Tests**: `test_logic.py` was calling `calculate_suitability` with the old 3-parameter signature and asserting against stale English string values. Updated to match the current 5-parameter signature and issue-code format (`TEMPO_TOO_FAST`, `SOUND_TOO_BRIGHT`, etc.).
- **`.gitignore` Overly Broad `lib/` Rule**: The Python `lib/` ignore pattern was incorrectly suppressing `frontend/lib/` (containing `api.ts` and `i18n.tsx`), leaving those files untracked. Narrowed the rule to `venv/lib/`.

## Improvements
- **Structured Logging**: Replaced all `print()` calls in `backend/main.py` and `backend/analysis.py` with Python's standard `logging` module (`INFO`/`WARNING`/`ERROR` levels).
- **Named Constants**: Extracted all magic threshold numbers in `analysis.py` into module-level named constants (`BPM_MIN`, `BPM_MAX`, `CENTROID_SOFT_LIMIT`, `RMS_MAX`, `ZCR_MAX`, `ONSET_MAX`) with comments explaining their intent.
- **Safe Temp File Handling**: Replaced ad-hoc `temp_*` filename construction with `tempfile.NamedTemporaryFile`; deletion failures now log a `WARNING` instead of silently failing.
- **Configurable API URL**: Frontend `api.ts` now reads the backend base URL from `NEXT_PUBLIC_API_URL` environment variable (falls back to `http://localhost:8000`).
- **History Persistence**: Analysis history is now saved to `localStorage` and restored on page load. Blob URLs (local file references) are excluded from persistence since they are session-scoped.
- **Browser Language Detection**: `LanguageProvider` now detects `navigator.language` at startup — Chinese browsers default to `zh`, all others default to `en`.
- **Frontend File Size Validation**: Added `maxSize: 100 MB` to the `react-dropzone` configuration for early client-side rejection of oversized files.
- **Page Metadata**: Corrected the Next.js `layout.tsx` title from the boilerplate `"Create Next App"` to `"MusicPicker"`.

## Technical Details
- **Backend**:
  - `main.py`: CORS config, URL validation (`_validate_url`), size limits, `tempfile` usage, `logging`
  - `analysis.py`: Named threshold constants, `logging`
  - `test_logic.py`: Fixed function signature and assertions
- **Frontend**:
  - `lib/api.ts`: `NEXT_PUBLIC_API_URL` env var support
  - `lib/i18n.tsx`: `detectDefaultLanguage()` using `navigator.language`
  - `app/layout.tsx`: Corrected page title and description
  - `app/page.tsx`: `localStorage` history persistence with `useEffect`
  - `components/AudioUploader.tsx`: `maxSize` added to dropzone config
- **Project**:
  - `.gitignore`: Fixed `lib/` → `venv/lib/` to unblock `frontend/lib/` tracking

---

# Release Note - v0.2.0 (Audio Player & UI Enhancements)

## New Features
- **Waveform Audio Player**: Integrated `wavesurfer.js` to visualize audio waveforms and provide playback controls.
  - Added a main player in the Analysis Report section.
  - Added mini players for each item in the History List.
- **Playback Synchronization**: Implemented mutual exclusion logic so that playing one audio track automatically pauses all others.
- **Enhanced Analysis Report**:
  - Added filename display in the report header for better context.
  - Clicking a history item now updates the main report view and loads the corresponding audio.

## Improvements
- **History Management**:
  - Refactored history items to use unique IDs for better state stability.
  - Optimized list rendering and player reference management.
- **Error Handling**:
  - Fixed `Runtime AbortError` issues caused by interrupting audio loading or rapid component unmounting.
  - Improved robustness of the audio loading process.

## Technical Details
- **Frontend**:
  - New Component: `WaveformPlayer.tsx`
  - Updated `AnalysisResult.tsx` to include the player and filename header.
  - Updated `HistoryList.tsx` to support mini players and playback control.
  - Updated `page.tsx` to manage audio URLs and history selection state.
  - Dependencies: Added `wavesurfer.js`.

## Bug Fixes
- Resolved an issue where the previous audio would continue playing after starting a new one.
- Fixed a crash (AbortError) occurring during file upload when the previous player instance was destroyed while loading.
