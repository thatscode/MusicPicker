'use client';

import React, { useState } from 'react';
import { AudioUploader } from '@/components/AudioUploader';
import { AnalysisResult } from '@/components/AnalysisResult';
import { RecommendationList } from '@/components/RecommendationList';
import { LanguageToggle } from '@/components/LanguageToggle';
import { HistoryList } from '@/components/HistoryList';
import { analyzeAudio, analyzeAudioUrl, getRecommendations, AnalysisResult as AnalysisResultType, Recommendation } from '@/lib/api';
import { Music, Sparkles } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/lib/i18n';

interface HistoryItem {
  id: string;
  result: AnalysisResultType;
  timestamp: string;
  audioUrl?: string;
}

function MusicPickerApp() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { t } = useLanguage();

  const processResult = async (result: AnalysisResultType, currentAudioUrl?: string) => {
    setStatusMessage(t.statusProcessing);
    setAnalysisResult(result);

    // Add to history
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      result: result,
      timestamp: new Date().toLocaleTimeString(),
      audioUrl: currentAudioUrl,
    };
    setHistory(prev => [newHistoryItem, ...prev]);

    // 2. Get Recommendations
    setStatusMessage(t.statusFetching);
    if (result.suitability_score < 7.0) {
      const recs = await getRecommendations('Ambient');
      setRecommendations(recs);
    } else {
      const recs = await getRecommendations();
      setRecommendations(recs);
    }
  };

  const handleUpload = async (file: File) => {
    setIsAnalyzing(true);
    setStatusMessage(t.statusUploading);
    setErrorMessage(null);
    setAnalysisResult(null);
    setRecommendations([]);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    try {
      setStatusMessage(t.statusAnalyzing);
      const result = await analyzeAudio(file);
      await processResult(result, url);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(t.errorFailed);
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
    }
  };

  const handleUrlUpload = async (url: string) => {
    setIsAnalyzing(true);
    setStatusMessage(t.statusUploading); // Reusing message, maybe add specific one for URL
    setErrorMessage(null);
    setAnalysisResult(null);
    setRecommendations([]);
    setAudioUrl(url);

    try {
      setStatusMessage(t.statusAnalyzing);
      const result = await analyzeAudioUrl(url);
      await processResult(result, url);
    } catch (error: any) {
      console.error('Error processing URL:', error);
      setErrorMessage(error.message || t.errorFailed);
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setAnalysisResult(item.result);
    setAudioUrl(item.audioUrl || null);
    // Optionally scroll to top or results section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <header className="text-center space-y-4 pt-12 relative">
          <div className="absolute top-0 right-0">
            <LanguageToggle />
          </div>
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Music className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {t.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-8">

          {/* Upload Section */}
          <section>
            <AudioUploader
              onUpload={handleUpload}
              onUrlUpload={handleUrlUpload}
              isAnalyzing={isAnalyzing}
              statusMessage={statusMessage}
            />
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-center">
                {errorMessage}
              </div>
            )}
          </section>

          {/* Results Section */}
          {analysisResult && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <AnalysisResult result={analysisResult} audioUrl={audioUrl || undefined} />
            </section>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <RecommendationList recommendations={recommendations} />
            </section>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <HistoryList
                history={history}
                onClear={() => setHistory([])}
                onSelect={handleHistorySelect}
              />
            </section>
          )}

        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 py-12 border-t border-gray-900">
          <p className="flex items-center justify-center gap-2">
            <Sparkles size={16} /> {t.poweredBy}
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <MusicPickerApp />
    </LanguageProvider>
  );
}
