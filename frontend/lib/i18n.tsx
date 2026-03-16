'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadSubtitle: string;
    analyzing: string;
    dragDrop: string;
    analysisReport: string;
    score: string;
    tempo: string;
    brightness: string;
    energy: string;
    zcr: string;
    onsetStrength: string;
    assessment: string;
    recommendations: string;
    poweredBy: string;
    statusUploading: string;
    statusAnalyzing: string;
    statusProcessing: string;
    statusFetching: string;
    errorFailed: string;
    uploadButton: string;
    pleaseUpload: string;
    enterUrl: string;
    analyzeUrl: string;
    invalidUrl: string;
    issues: {
        TEMPO_TOO_FAST: string;
        TEMPO_TOO_SLOW: string;
        SOUND_TOO_BRIGHT: string;
        VOLUME_TOO_HIGH: string;
        SOUND_TOO_NOISY: string;
        RHYTHM_TOO_INTENSE: string;
        GOOD_BALANCE: string;
    };
    criteria: {
        title: string;
        bpm: string;
        brightness: string;
        energy: string;
        zcr: string;
        onsetStrength: string;
    };
    history: {
        title: string;
        time: string;
        clear: string;
        empty: string;
    };
}

const translations: Record<Language, Translations> = {
    en: {
        title: 'Music Picker',
        subtitle: 'Optimize your office wake-up calls. Analyze audio tracks for the perfect balance of energy and comfort.',
        uploadTitle: 'Upload Audio File',
        uploadSubtitle: 'Extracting features (BPM, Energy, Brightness)...',
        analyzing: 'Analyzing Audio...',
        dragDrop: 'Drag & drop or click to select a file',
        analysisReport: 'Analysis Report',
        score: 'Score',
        tempo: 'Tempo (BPM)',
        brightness: 'Brightness (Hz)',
        energy: 'Energy (RMS)',
        zcr: 'Noisiness (ZCR)',
        onsetStrength: 'Impact (Onset Strength)',
        assessment: 'Assessment',
        recommendations: 'Recommended Alternatives',
        poweredBy: 'Powered by Antigravity AI',
        statusUploading: 'Uploading and starting analysis...',
        statusAnalyzing: 'Analyzing audio features (this may take 10-20 seconds)...',
        statusProcessing: 'Processing results...',
        statusFetching: 'Fetching recommendations...',
        errorFailed: 'Failed to analyze audio. Please check the console for details or try another file.',
        uploadButton: 'Upload',
        pleaseUpload: 'Please upload an audio file.',
        enterUrl: 'Or enter an audio URL',
        analyzeUrl: 'Analyze URL',
        invalidUrl: 'Please enter a valid URL.',
        issues: {
            TEMPO_TOO_FAST: 'Tempo is too fast (potential anxiety).',
            TEMPO_TOO_SLOW: 'Tempo is too slow (might not wake up).',
            SOUND_TOO_BRIGHT: 'Sound is too sharp/bright (jarring).',
            VOLUME_TOO_HIGH: 'Average volume is too high (loudness war).',
            SOUND_TOO_NOISY: 'Sound is too noisy/distorted.',
            RHYTHM_TOO_INTENSE: 'Rhythm is too intense/punchy.',
            GOOD_BALANCE: 'Good balance of tempo and tone.',
        },
        criteria: {
            title: 'Scoring Criteria',
            bpm: 'Tempo: 50 - 130 BPM',
            brightness: 'Brightness: < 2500 Hz',
            energy: 'Energy: < 0.18 RMS',
            zcr: 'Noisiness: < 0.08',
            onsetStrength: 'Impact: < 1.2',
        },
        history: {
            title: 'Analysis History',
            time: 'Time',
            clear: 'Clear History',
            empty: 'No history yet.',
        },
    },
    zh: {
        title: '音乐挑选器',
        subtitle: '优化您的办公室午休唤醒铃声。分析音频轨道，寻找能量与舒适的完美平衡。',
        uploadTitle: '上传音频文件',
        uploadSubtitle: '正在提取特征（BPM、能量、亮度）...',
        analyzing: '正在分析音频...',
        dragDrop: '拖放或点击选择文件',
        analysisReport: '分析报告',
        score: '评分',
        tempo: '节奏 (BPM)',
        brightness: '亮度 (Hz)',
        energy: '能量 (RMS)',
        zcr: '噪度 (ZCR)',
        onsetStrength: '冲击力 (Onset Strength)',
        assessment: '评估结果',
        recommendations: '推荐替代曲目',
        poweredBy: '由 Antigravity AI 提供支持',
        statusUploading: '正在上传并开始分析...',
        statusAnalyzing: '正在分析音频特征（可能需要 10-20 秒）...',
        statusProcessing: '正在处理结果...',
        statusFetching: '正在获取推荐...',
        errorFailed: '音频分析失败。请查看控制台了解详情或尝试其他文件。',
        uploadButton: '上传',
        pleaseUpload: '请上传一个音频文件。',
        enterUrl: '或者输入音频链接',
        analyzeUrl: '分析链接',
        invalidUrl: '请输入有效的链接。',
        issues: {
            TEMPO_TOO_FAST: '节奏太快（可能引起焦虑）。',
            TEMPO_TOO_SLOW: '节奏太慢（可能无法唤醒）。',
            SOUND_TOO_BRIGHT: '声音太尖锐/刺耳。',
            VOLUME_TOO_HIGH: '平均音量过高。',
            SOUND_TOO_NOISY: '声音太嘈杂/失真严重。',
            RHYTHM_TOO_INTENSE: '节奏冲击力过强。',
            GOOD_BALANCE: '节奏和音色平衡良好。',
        },
        criteria: {
            title: '评分标准',
            bpm: '节奏：50 - 130 BPM',
            brightness: '亮度：< 2500 Hz',
            energy: '能量：< 0.18 RMS',
            zcr: '噪度：< 0.08',
            onsetStrength: '冲击力：< 1.2',
        },
        history: {
            title: '测评记录',
            time: '时间',
            clear: '清空记录',
            empty: '暂无记录。',
        },
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectDefaultLanguage(): Language {
    if (typeof navigator === 'undefined') return 'zh';
    const lang = navigator.language || '';
    return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(detectDefaultLanguage);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
