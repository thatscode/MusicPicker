import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.analysis import calculate_suitability

def test_suitability_logic():
    print("Testing Suitability Logic...")
    
    # Case 1: Ideal Wake-up
    score, reason = calculate_suitability(bpm=100, centroid=2000, rms=0.1)
    print(f"Case 1 (Ideal): Score={score}, Reason={reason}")
    assert score >= 8.0, "Ideal case should have high score"

    # Case 2: Too Fast (Heavy Metal)
    score, reason = calculate_suitability(bpm=180, centroid=4000, rms=0.3)
    print(f"Case 2 (Fast/Loud): Score={score}, Reason={reason}")
    assert score < 5.0, "Heavy metal should have low score"
    assert "Tempo is too fast" in reason
    assert "Sound is too sharp" in reason

    # Case 3: Too Slow (Sleepy)
    score, reason = calculate_suitability(bpm=50, centroid=1000, rms=0.05)
    print(f"Case 3 (Slow): Score={score}, Reason={reason}")
    assert score < 8.0, "Too slow should be penalized"
    assert "Tempo is too slow" in reason

    print("All logic tests passed!")

if __name__ == "__main__":
    test_suitability_logic()
