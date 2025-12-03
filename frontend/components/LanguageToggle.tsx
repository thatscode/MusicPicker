'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
        >
            <Globe size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-200">
                {language === 'en' ? 'English' : '中文'}
            </span>
        </button>
    );
}
