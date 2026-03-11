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
}

export default function VoiceInput({ onResult, isSquare = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Your browser does not support voice input. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      
      if (event.results[current].isFinal) {
        onResult(transcriptText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleListening}
        className={`
          w-14 h-14 flex items-center justify-center transition-all duration-300 relative overflow-hidden
          ${isSquare ? 'rounded-xl' : 'rounded-full'}
          ${isListening 
            ? 'animate-gradientShift scale-110 shadow-lg' 
            : 'bg-gray-300 hover:bg-gray-400 hover:scale-105 shadow-md'}
        `}
      >
        <span className={`relative z-10 text-xl transition-transform duration-300 ${isListening ? 'animate-pulse-scale text-white' : 'text-gray-700'}`}>
          🎙️
        </span>
      </button>
    </div>
  );
}