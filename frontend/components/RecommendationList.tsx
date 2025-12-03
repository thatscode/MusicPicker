'use client';

import React from 'react';
import { Recommendation } from '@/lib/api';
import { Disc, Play, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface RecommendationListProps {
    recommendations: Recommendation[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
    const { t } = useLanguage();
    if (recommendations.length === 0) return null;

    return (
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 mt-8">
            <div className="flex items-center gap-2 mb-6">
                <Disc className="text-purple-500" />
                <h2 className="text-2xl font-bold">{t.recommendations}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((track, index) => (
                    <div
                        key={index}
                        className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                {track.genre}
                            </span>
                            <a
                                href={track.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition-colors"
                                title="Listen on YouTube"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>

                        <h3 className="font-bold text-lg mb-1 truncate">{track.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{track.artist}</p>

                        <div className="text-xs text-gray-500 italic border-t border-gray-700 pt-2">
                            "{track.reason}"
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
