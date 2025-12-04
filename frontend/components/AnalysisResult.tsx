import React from 'react';
import { AnalysisResult as AnalysisResultType } from '@/lib/api';
import { Activity, Music2, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/lib/i18n';
import { WaveformPlayer } from './WaveformPlayer';

interface AnalysisResultProps {
    result: AnalysisResultType;
    audioUrl?: string;
}

export function AnalysisResult({ result, audioUrl }: AnalysisResultProps) {
    const { t } = useLanguage();
    const isSuitable = result.suitability_score >= 7.0;

    // Normalize values to 0-100 scale for Radar Chart
    // These max values are approximate upper bounds for visualization
    const normalize = (value: number, max: number) => Math.min(100, (value / max) * 100);

    const data = [
        { subject: t.tempo.split(' ')[0], A: normalize(result.bpm, 180), fullMark: 100, value: result.bpm },
        { subject: t.energy.split(' ')[0], A: normalize(result.rms_energy, 0.3), fullMark: 100, value: result.rms_energy },
        { subject: t.brightness.split(' ')[0], A: normalize(result.spectral_centroid, 4000), fullMark: 100, value: result.spectral_centroid },
        { subject: t.zcr.split(' ')[0], A: normalize(result.zcr, 0.15), fullMark: 100, value: result.zcr },
        { subject: t.onsetStrength.split(' ')[0], A: normalize(result.onset_strength, 2.0), fullMark: 100, value: result.onset_strength },
    ];

    return (
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
            <div className="flex items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 flex-shrink-0">
                    <Activity className="text-blue-500" />
                    {t.analysisReport}
                </h2>

                <div className="flex-grow text-center px-4">
                    <span className="text-lg font-medium text-gray-300 truncate block max-w-md mx-auto" title={result.filename}>
                        {result.filename}
                    </span>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold flex-shrink-0 ${isSuitable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {isSuitable ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {t.score}: {result.suitability_score}/10
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Metrics List */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Music2 className="text-blue-400" size={16} />
                                <span className="text-gray-400 text-sm">{t.tempo}</span>
                            </div>
                            <div className="text-xl font-mono">{result.bpm}</div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="text-yellow-400" size={16} />
                                <span className="text-gray-400 text-sm">{t.brightness}</span>
                            </div>
                            <div className="text-xl font-mono">{result.spectral_centroid}</div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="text-red-400" size={16} />
                                <span className="text-gray-400 text-sm">{t.energy}</span>
                            </div>
                            <div className="text-xl font-mono">{result.rms_energy}</div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="text-purple-400" size={16} />
                                <span className="text-gray-400 text-sm">{t.zcr}</span>
                            </div>
                            <div className="text-xl font-mono">{result.zcr}</div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="text-pink-400" size={16} />
                                <span className="text-gray-400 text-sm">{t.onsetStrength}</span>
                            </div>
                            <div className="text-xl font-mono">{result.onset_strength}</div>
                        </div>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="h-80 bg-gray-800/30 rounded-lg p-4 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Metrics"
                                dataKey="A"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="#3b82f6"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number, name: string, props: any) => [props.payload.value, props.payload.subject]}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold mb-1 text-gray-200">{t.assessment}</h3>
                <p className="text-gray-400">
                    {result.suitability_issues.map(issue => t.issues[issue as keyof typeof t.issues] || issue).join('; ')}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
                <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">{t.criteria.title}</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                    <li>• {t.criteria.bpm}</li>
                    <li>• {t.criteria.brightness}</li>
                    <li>• {t.criteria.energy}</li>
                    <li>• {t.criteria.zcr}</li>
                    <li>• {t.criteria.onsetStrength}</li>
                </ul>
            </div>

            {audioUrl && <WaveformPlayer audioUrl={audioUrl} />}
        </div>
    );
}
