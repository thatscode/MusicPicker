import librosa
import numpy as np
import os

def analyze_audio(file_path: str):
    """
    Analyze audio file to extract features suitable for wake-up music assessment.
    Returns a dictionary with quantitative metrics and a suitability score.
    """
    try:
        print(f"[{file_path}] Starting analysis...")
        # Load audio file
        print(f"[{file_path}] Loading audio file (duration=60s)...")
        y, sr = librosa.load(file_path, duration=60)  # Analyze first 60 seconds

        # 1. Tempo (BPM)
        print(f"[{file_path}] Calculating BPM...")
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        bpm = float(tempo)
        print(f"[{file_path}] BPM: {bpm}")

        # 2. Spectral Centroid (Brightness)
        print(f"[{file_path}] Calculating Spectral Centroid...")
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        avg_spectral_centroid = float(np.mean(spectral_centroids))
        print(f"[{file_path}] Centroid: {avg_spectral_centroid}")

        # 3. RMS Energy (Loudness/Intensity)
        print(f"[{file_path}] Calculating RMS Energy...")
        rms = librosa.feature.rms(y=y)[0]
        avg_rms = float(np.mean(rms))
        print(f"[{file_path}] RMS: {avg_rms}")

        # 4. Zero Crossing Rate (Noisiness/Distortion)
        print(f"[{file_path}] Calculating ZCR...")
        zcr = librosa.feature.zero_crossing_rate(y=y)[0]
        avg_zcr = float(np.mean(zcr))
        print(f"[{file_path}] ZCR: {avg_zcr}")

        # 5. Onset Strength (Impact/Punchiness)
        print(f"[{file_path}] Calculating Onset Strength...")
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        avg_onset = float(np.mean(onset_env))
        print(f"[{file_path}] Onset: {avg_onset}")

        # 6. Suitability Score
        print(f"[{file_path}] Calculating Suitability Score...")
        suitability_score, issues = calculate_suitability(bpm, avg_spectral_centroid, avg_rms, avg_zcr, avg_onset)
        print(f"[{file_path}] Score: {suitability_score}")

        return {
            "filename": os.path.basename(file_path),
            "bpm": round(bpm, 2),
            "spectral_centroid": round(avg_spectral_centroid, 2),
            "rms_energy": round(avg_rms, 4),
            "zcr": round(avg_zcr, 4),
            "onset_strength": round(avg_onset, 4),
            "suitability_score": suitability_score,
            "suitability_issues": issues
        }

    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return None

def calculate_suitability(bpm, centroid, rms, zcr, onset):
    """
    Heuristic to calculate suitability for a wake-up call.
    Returns score and a list of issue codes.
    """
    score = 10.0
    issues = []

    # 1. BPM Penalties (Tempo)
    if bpm > 130: # Lowered threshold slightly
        score -= 2
        issues.append("TEMPO_TOO_FAST")
    elif bpm < 50:
        score -= 2
        issues.append("TEMPO_TOO_SLOW")
    
    # 2. Spectral Centroid Penalties (Brightness/Harshness)
    # Lowered threshold to 2500Hz. Progressive penalty.
    if centroid > 2500:
        penalty = 1.0
        if centroid > 3500:
            penalty = 3.0
        elif centroid > 3000:
            penalty = 2.0
        score -= penalty
        issues.append("SOUND_TOO_BRIGHT")
    
    # 3. RMS Penalties (Loudness)
    if rms > 0.18:
        score -= 2
        issues.append("VOLUME_TOO_HIGH")

    # 4. Zero Crossing Rate (Noisiness/Distortion)
    # High ZCR indicates noisy sounds (percussion, distortion)
    if zcr > 0.08: # Typical music is 0.03-0.06. Rock/Metal is higher.
        score -= 2
        issues.append("SOUND_TOO_NOISY")

    # 5. Onset Strength (Impact)
    # High onset strength means strong beats/percussion
    if onset > 1.2:
        score -= 2
        issues.append("RHYTHM_TOO_INTENSE")

    score = max(0.0, min(10.0, score))
    
    if not issues:
        issues.append("GOOD_BALANCE")
    
    return round(score, 1), issues

