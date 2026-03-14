// app/components/VoiceInput.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onResult: (text: string) => void;
  isSquare?: boolean;
  fullWidth?: boolean;
  language?: string;
}

export default function VoiceInput({ 
  onResult, 
  isSquare = false, 
  fullWidth = false,
  language = 'auto'
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en-US');
  
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
  ];

  useEffect(() => {
    if (language === 'auto') {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
      const supported = languages.find(l => l.code === browserLang);
      setSelectedLang(supported ? browserLang : 'en-US');
    } else {
      setSelectedLang(language);
    }
  }, [language]);

  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    if (!supported) console.log('Web Speech API not supported in this browser');
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      if (event.results[current].isFinal) onResult(transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      if (event.error === 'language-not-supported') setSelectedLang('en-US');
    };

    recognitionRef.current = recognition;
  }, [onResult, isSupported, selectedLang]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice input is not supported in your browser. Try Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!isSupported) {
    return <div className="text-sm text-gray-500">🗣 Voice input not supported</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleListening}
        className={`
          ${fullWidth ? 'w-full py-5' : 'w-14 h-14'}
          flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden
          ${isSquare ? 'rounded-3xl' : 'rounded-full'}
          ${isListening 
            ? 'animate-gradientShift text-white' 
            : 'bg-gray-300 hover:bg-gray-400 hover:scale-105 shadow-md text-gray-700'}
        `}
      >
        <span className={`relative z-10 text-xl transition-transform duration-300 ${isListening ? 'animate-pulse-scale' : ''}`}>
          🎙️
        </span>
        {fullWidth && (
          <span className={`relative z-10 text-xs font-medium ${isListening ? 'text-white' : 'text-gray-500'}`}>
            Hold to speak
          </span>
        )}
      </button>
    </div>
  );
}

// Отдельный компонент для выбора языка (будет использоваться в родителе)
export const LanguageSelector = ({ 
  selectedLang, 
  onLanguageChange 
}: { 
  selectedLang: string; 
  onLanguageChange: (code: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸', short: 'en' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺', short: 'ru' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸', short: 'es' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷', short: 'fr' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪', short: 'de' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳', short: 'zh' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', short: 'ar' },
  ];

  const currentLang = languages.find(l => l.code === selectedLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <span>{currentLang.flag}</span>
        <span className="font-medium">{currentLang.short}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 ${
                selectedLang === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};