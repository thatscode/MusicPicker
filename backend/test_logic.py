import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from analysis import calculate_suitability

def test_suitability_logic():
    print("Testing Suitability Logic...")

    # Case 1: Ideal Wake-up — moderate tempo, low brightness, low energy
    score, issues = calculate_suitability(bpm=100, centroid=2000, rms=0.1, zcr=0.05, onset=1.0)
    print(f"Case 1 (Ideal): Score={score}, Issues={issues}")
    assert score >= 8.0, f"Ideal case should have high score, got {score}"
    assert "GOOD_BALANCE" in issues, f"Expected GOOD_BALANCE, got {issues}"

    # Case 2: Too Fast / Heavy Metal — high BPM, harsh brightness, loud & noisy
    score, issues = calculate_suitability(bpm=180, centroid=4000, rms=0.3, zcr=0.1, onset=1.5)
    print(f"Case 2 (Fast/Loud): Score={score}, Issues={issues}")
    assert score < 5.0, f"Heavy metal should have low score, got {score}"
    assert "TEMPO_TOO_FAST" in issues, f"Expected TEMPO_TOO_FAST, got {issues}"
    assert "SOUND_TOO_BRIGHT" in issues, f"Expected SOUND_TOO_BRIGHT, got {issues}"

    # Case 3: Too Slow — BPM below minimum threshold
    score, issues = calculate_suitability(bpm=30, centroid=1000, rms=0.05, zcr=0.03, onset=0.5)
    print(f"Case 3 (Slow): Score={score}, Issues={issues}")
    assert score <= 8.0, f"Too slow should be penalized, got {score}"
    assert "TEMPO_TOO_SLOW" in issues, f"Expected TEMPO_TOO_SLOW, got {issues}"

    print("All logic tests passed!")

if __name__ == "__main__":
    test_suitability_logic()
