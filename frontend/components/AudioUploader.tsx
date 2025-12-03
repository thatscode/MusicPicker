import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, Loader2, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface AudioUploaderProps {
    onUpload: (file: File) => void;
    onUrlUpload: (url: string) => void;
    isAnalyzing: boolean;
    statusMessage: string;
}

export function AudioUploader({ onUpload, onUrlUpload, isAnalyzing, statusMessage }: AudioUploaderProps) {
    const { t } = useLanguage();
    const [urlMode, setUrlMode] = useState(false);
    const [url, setUrl] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
        },
        maxFiles: 1,
        disabled: isAnalyzing
    });

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onUrlUpload(url.trim());
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => setUrlMode(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!urlMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    {t.uploadTitle}
                </button>
                <button
                    onClick={() => setUrlMode(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${urlMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    {t.enterUrl}
                </button>
            </div>

            {urlMode ? (
                <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                    <form onSubmit={handleUrlSubmit} className="space-y-4">
                        <div className="relative max-w-md mx-auto">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/audio.mp3"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isAnalyzing}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAnalyzing || !url.trim()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    {t.analyzing}
                                </span>
                            ) : (
                                t.analyzeUrl
                            )}
                        </button>
                    </form>
                    {isAnalyzing && (
                        <div className="mt-4 text-blue-400 animate-pulse">
                            {statusMessage}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'}
            ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-4">
                        {isAnalyzing ? (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-blue-400">{t.analyzing}</h3>
                                    <p className="text-gray-400 animate-pulse">{statusMessage}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-gray-800 rounded-full">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">{t.uploadTitle}</h3>
                                    <p className="text-gray-400 max-w-sm mx-auto">
                                        {t.dragDrop}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t.uploadSubtitle}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
