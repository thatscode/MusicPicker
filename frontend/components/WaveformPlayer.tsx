import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Loader2 } from 'lucide-react';

interface WaveformPlayerProps {
    audioUrl: string;
    height?: number;
    onPlay?: () => void;
}

export interface WaveformPlayerRef {
    pause: () => void;
}

export const WaveformPlayer = forwardRef<WaveformPlayerRef, WaveformPlayerProps>(({ audioUrl, height = 80, onPlay }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const onPlayRef = useRef(onPlay);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('00:00');
    const [currentTime, setCurrentTime] = useState('00:00');
    const [isLoading, setIsLoading] = useState(true);

    // Update ref when onPlay prop changes
    useEffect(() => {
        onPlayRef.current = onPlay;
    }, [onPlay]);

    useImperativeHandle(ref, () => ({
        pause: () => {
            if (wavesurfer.current) {
                wavesurfer.current.pause();
            }
        }
    }));

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secondsRemainder = Math.floor(seconds % 60);
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = secondsRemainder.toString().padStart(2, '0');
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize WaveSurfer
        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#4b5563', // gray-600
            progressColor: '#3b82f6', // blue-500
            cursorColor: '#60a5fa', // blue-400
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            height: height,
            normalize: true,
            backend: 'WebAudio',
        });

        // Load audio safely
        const loadAudio = async () => {
            if (wavesurfer.current) {
                try {
                    await wavesurfer.current.load(audioUrl);
                } catch (err) {
                    // Ignore AbortError which happens if destroyed while loading
                    if (err instanceof Error && err.name === 'AbortError') {
                        return;
                    }
                    console.error('WaveSurfer load error:', err);
                }
            }
        };

        loadAudio();

        // Events
        wavesurfer.current.on('ready', () => {
            setIsLoading(false);
            setDuration(formatTime(wavesurfer.current?.getDuration() || 0));
        });

        wavesurfer.current.on('audioprocess', () => {
            setCurrentTime(formatTime(wavesurfer.current?.getCurrentTime() || 0));
        });

        wavesurfer.current.on('interaction', () => {
            setCurrentTime(formatTime(wavesurfer.current?.getCurrentTime() || 0));
        });

        wavesurfer.current.on('play', () => {
            setIsPlaying(true);
            if (onPlayRef.current) {
                onPlayRef.current();
            }
        });

        wavesurfer.current.on('pause', () => {
            setIsPlaying(false);
        });

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
        });

        return () => {
            try {
                wavesurfer.current?.destroy();
            } catch (error) {
                // Ignore AbortError which happens if destroyed while loading
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('WaveSurfer destroy error:', error);
                }
            }
            wavesurfer.current = null;
        };
    }, [audioUrl, height]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
        }
    };

    return (
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 mt-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : isPlaying ? (
                        <Pause className="w-6 h-6 text-white fill-current" />
                    ) : (
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                    )}
                </button>

                <div className="flex-grow relative h-20" ref={containerRef}>
                    {/* Waveform will be rendered here */}
                </div>

                <div className="flex-shrink-0 font-mono text-sm text-gray-400 w-24 text-right">
                    {currentTime} / {duration}
                </div>
            </div>
        </div>
    );
});

WaveformPlayer.displayName = 'WaveformPlayer';
