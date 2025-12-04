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
