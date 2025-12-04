'use client';

import React, { useRef } from 'react';
import { AnalysisResult } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Clock, Trash2 } from 'lucide-react';
import { WaveformPlayer, WaveformPlayerRef } from './WaveformPlayer';

interface HistoryItem {
    id: string;
    result: AnalysisResult;
    timestamp: string;
    audioUrl?: string;
}

interface HistoryListProps {
    history: HistoryItem[];
    onClear: () => void;
    onSelect: (item: HistoryItem) => void;
}

export function HistoryList({ history, onClear, onSelect }: HistoryListProps) {
    const { t } = useLanguage();
    const playerRefs = useRef<Map<string, WaveformPlayerRef>>(new Map());

    if (history.length === 0) return null;

    const handlePlay = (id: string, item: HistoryItem) => {
        // Pause all other players in the list
        playerRefs.current.forEach((ref, key) => {
            if (key !== id) {
                ref.pause();
            }
        });

        // Select this item to update the main view
        onSelect(item);
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 mt-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-200">{t.history.title}</h2>
                </div>
                <button
                    onClick={onClear}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                >
                    <Trash2 size={14} />
                    {t.history.clear}
                </button>
            </div>

            <div className="space-y-4">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="bg-gray-800/30 p-4 rounded-lg border border-transparent hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => onSelect(item)}>
                            <div>
                                <div className="font-medium text-gray-200 mb-1">{item.result.filename}</div>
                                <div className="text-xs text-gray-500 flex gap-3">
                                    <span>{item.timestamp}</span>
                                    <span>BPM: {item.result.bpm}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.result.suitability_score >= 7.0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {item.result.suitability_score}
                            </div>
                        </div>

                        {item.audioUrl && (
                            <div className="mt-2">
                                <WaveformPlayer
                                    ref={(el) => {
                                        if (el) {
                                            playerRefs.current.set(item.id, el);
                                        } else {
                                            playerRefs.current.delete(item.id);
                                        }
                                    }}
                                    audioUrl={item.audioUrl}
                                    height={40}
                                    onPlay={() => handlePlay(item.id, item)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
