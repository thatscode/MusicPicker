'use client';

import React from 'react';
import { AnalysisResult } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Clock, Trash2 } from 'lucide-react';

interface HistoryItem {
    result: AnalysisResult;
    timestamp: string;
}

interface HistoryListProps {
    history: HistoryItem[];
    onClear: () => void;
}

export function HistoryList({ history, onClear }: HistoryListProps) {
    const { t } = useLanguage();

    if (history.length === 0) return null;

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

            <div className="space-y-3">
                {history.map((item, index) => (
                    <div key={index} className="bg-gray-800/30 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-200 mb-1">{item.result.filename}</div>
                            <div className="text-xs text-gray-500 flex gap-3">
                                <span>{item.timestamp}</span>
                                <span>BPM: {item.result.bpm}</span>
                                <span>Score: {item.result.suitability_score}</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.result.suitability_score >= 7.0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {item.result.suitability_score}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
