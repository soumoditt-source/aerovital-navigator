import { create } from 'zustand'

export type AppLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te';

export const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
] as const;

interface LanguageState {
    language: AppLanguage;
    setLanguage: (lang: AppLanguage) => void;
    getLanguagePrompt: () => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
    language: 'en',
    setLanguage: (lang) => set({ language: lang }),
    getLanguagePrompt: () => {
        const current = get().language;
        const langMap: Record<AppLanguage, string> = {
            en: 'English',
            hi: 'Hindi',
            bn: 'Bengali',
            mr: 'Marathi',
            ta: 'Tamil',
            te: 'Telugu'
        };

        if (current === 'en') return 'Reply natively in English.';
        return `CRITICAL INSTRUCTION: You MUST reply entirely in native ${langMap[current]} text. Do NOT use English translations.`;
    }
}))
