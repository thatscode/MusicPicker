import librosa
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Scoring thresholds — tune these to adjust what "good wake-up music" means
# ---------------------------------------------------------------------------

# BPM: too slow to rouse, or too fast and anxiety-inducing
BPM_MIN = 50
BPM_MAX = 130

# Spectral centroid (Hz): higher values = brighter / harsher tone
CENTROID_SOFT_LIMIT = 2500   # mild penalty above this
CENTROID_MID_LIMIT  = 3000   # moderate penalty above this
CENTROID_HARD_LIMIT = 3500   # severe penalty above this

# RMS energy: peak loudness beyond this triggers a penalty
RMS_MAX = 0.18

# Zero crossing rate: high ZCR = noisy/distorted (rock/metal typically 0.08+)
ZCR_MAX = 0.08

# Onset strength: strong transients (drums, percussion) tire the ears quickly
ONSET_MAX = 1.2

# Only analyse the first N seconds — keeps latency manageable
ANALYSIS_DURATION_SECONDS = 60

# ---------------------------------------------------------------------------


def analyze_audio(file_path: str):
    """
    Analyse an audio file and return feature metrics plus a suitability score.
    Returns None on failure.
    """
    try:
        logger.info("[%s] Starting analysis...", file_path)

        logger.info("[%s] Loading audio (duration=%ds)...", file_path, ANALYSIS_DURATION_SECONDS)
        y, sr = librosa.load(file_path, duration=ANALYSIS_DURATION_SECONDS)

        # 1. Tempo (BPM)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        bpm = float(tempo)
        logger.info("[%s] BPM: %.2f", file_path, bpm)

        # 2. Spectral Centroid (Brightness)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        avg_spectral_centroid = float(np.mean(spectral_centroids))
        logger.info("[%s] Centroid: %.2f Hz", file_path, avg_spectral_centroid)

        # 3. RMS Energy (Loudness)
        rms = librosa.feature.rms(y=y)[0]
        avg_rms = float(np.mean(rms))
        logger.info("[%s] RMS: %.4f", file_path, avg_rms)

        # 4. Zero Crossing Rate (Noisiness)
        zcr = librosa.feature.zero_crossing_rate(y=y)[0]
        avg_zcr = float(np.mean(zcr))
        logger.info("[%s] ZCR: %.4f", file_path, avg_zcr)

        # 5. Onset Strength (Impact / Punchiness)
        onset_env2 = librosa.onset.onset_strength(y=y, sr=sr)
        avg_onset = float(np.mean(onset_env2))
        logger.info("[%s] Onset: %.4f", file_path, avg_onset)

        # 6. Suitability Score
        suitability_score, issues = calculate_suitability(bpm, avg_spectral_centroid, avg_rms, avg_zcr, avg_onset)
        logger.info("[%s] Score: %.1f  Issues: %s", file_path, suitability_score, issues)

        return {
            "filename": os.path.basename(file_path),
            "bpm": round(bpm, 2),
            "spectral_centroid": round(avg_spectral_centroid, 2),
            "rms_energy": round(avg_rms, 4),
            "zcr": round(avg_zcr, 4),
            "onset_strength": round(avg_onset, 4),
            "suitability_score": suitability_score,
            "suitability_issues": issues,
        }

    except Exception as e:
        logger.exception("Error analysing %s: %s", file_path, e)
        return None


def calculate_suitability(bpm: float, centroid: float, rms: float, zcr: float, onset: float):
    """
    Heuristic scoring for wake-up music suitability.
    Returns (score: float, issues: list[str]).
    """
    score = 10.0
    issues = []

    # BPM penalties
    if bpm > BPM_MAX:
        score -= 2
        issues.append("TEMPO_TOO_FAST")
    elif bpm < BPM_MIN:
        score -= 2
        issues.append("TEMPO_TOO_SLOW")

    # Brightness penalties (progressive)
    if centroid > CENTROID_SOFT_LIMIT:
        if centroid > CENTROID_HARD_LIMIT:
            score -= 3.0
        elif centroid > CENTROID_MID_LIMIT:
            score -= 2.0
        else:
            score -= 1.0
        issues.append("SOUND_TOO_BRIGHT")

    # Loudness penalty
    if rms > RMS_MAX:
        score -= 2
        issues.append("VOLUME_TOO_HIGH")

    # Noisiness penalty
    if zcr > ZCR_MAX:
        score -= 2
        issues.append("SOUND_TOO_NOISY")

    # Impact penalty
    if onset > ONSET_MAX:
        score -= 2
        issues.append("RHYTHM_TOO_INTENSE")

    score = max(0.0, min(10.0, score))

    if not issues:
        issues.append("GOOD_BALANCE")

    return round(score, 1), issues
