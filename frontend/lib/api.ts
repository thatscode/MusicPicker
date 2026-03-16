const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnalysisResult {
  filename: string;
  bpm: number;
  spectral_centroid: number;
  rms_energy: number;
  zcr: number;
  onset_strength: number;
  suitability_score: number;
  suitability_issues: string[];
}

export interface Recommendation {
  title: string;
  artist: string;
  genre: string;
  reason: string;
  url: string;
}

export async function analyzeAudio(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}

export async function analyzeAudioUrl(url: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Analysis failed');
  }

  return response.json();
}

export async function getRecommendations(genre?: string): Promise<Recommendation[]> {
  const url = genre ? `${API_BASE_URL}/recommend?genre=${genre}` : `${API_BASE_URL}/recommend`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  return response.json();
}
