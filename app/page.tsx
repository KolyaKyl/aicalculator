// app/page.tsx
'use client';

import { useState, useRef } from 'react';
import VoiceInput, { LanguageSelector } from './components/VoiceInput';


interface ResultData {
  type?: 'math' | 'calculated' | 'unknown' | 'reasoning';
  result?: number;
  unit?: string;
  expression?: string;
  steps?: Array<{ value: string; meaning: string }> | Array<string>;
  description?: string;
  answer?: number | string;
  details?: string;
  message?: string;
  error?: string;
  suggestion?: string;
  
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedLang, setSelectedLang] = useState('en-US');

  const handleVoiceResult = async (text: string) => {
    setQuery(text);
    setInputText(text);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        type: 'unknown',
        message: 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      handleVoiceResult(inputText.trim());
    }
  };

  const clearInput = () => {
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        handleSubmit();
      }
    }
  };

  const exampleCards = [
    {
      icon: '🏠',
      title: 'MORTGAGE AND LOANS',
      query: 'mortgage 500k 4% 30 years monthly payment',
      color: 'blue'
    },
    {
      icon: '💰',
      title: 'TAXES AND SALARY',
      query: 'salary 80K, what will be the net in USA',
      color: 'yellow'
    },
    {
      icon: '🏃',
      title: 'WORKOUT AND NUTRITION',
      query: 'calories in 200g of pasta',
      color: 'orange'
    },
    {
      icon: '🍽️',
      title: 'TIPS AND PERCENTAGES',
      query: '20% tip on $45',
      color: 'green'
    },
    {
      icon: '💶',
      title: 'CURRENCIES CONVERSION',
      query: '10 euros to dollars',
      color: 'purple'
    },
    {
      icon: '√',
      title: 'MATH AND BASIC',
      query: 'square root of 25',
      color: 'gray'
    }
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'green': return 'bg-green-50 hover:bg-green-100 border-green-200';
      case 'purple': return 'bg-purple-50 hover:bg-purple-100 border-purple-200';
      case 'yellow': return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
      case 'orange': return 'bg-orange-50 hover:bg-orange-100 border-orange-200';
      default: return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    }
  };

  // Иконки
  const CopyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );

  return (
    <main className="bg-gray-100" style={{ minHeight: '100dvh' }}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 pt-14 pb-6 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                AI Calculator
              </h1>
            </div>
            <p className="text-gray-500 text-sm tracking-wide">
              JUST ASK · GET INSTANT ANSWER
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">

            {/* WHAT TO CALCULATE? label */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                WHAT TO CALCULATE?
              </div>

              {/* Language selector в правом верхнем углу */}
              <LanguageSelector
                selectedLang={selectedLang}
                onLanguageChange={(code) => {
                  setSelectedLang(code);
                  // Если нужно обновить язык в VoiceInput
                }}
              />
            </div>

            {/* Input row - десктоп версия (микрофон слева) */}
            <div className="hidden md:flex items-start gap-2">
              <div className="flex-shrink-0">
                <VoiceInput onResult={handleVoiceResult} isSquare={true} language={selectedLang} />
              </div>

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 15% of 2340"
                  rows={1}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12 resize-none overflow-y-auto min-h-[56px] max-h-[80px] leading-relaxed"
                  style={{ lineHeight: '1.5' }}
                />
                {inputText && (
                  <button
                    onClick={clearInput}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || loading}
                className={`flex-shrink-0 w-14 h-14 rounded-xl font-medium transition-all flex items-center justify-center ${inputText.trim() && !loading
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white hover:shadow-md'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
              >
                <SendIcon />
              </button>
            </div>

            {/* Input row - мобильная версия (микрофон снизу) */}
            <div className="md:hidden space-y-2">
              {/* Верхняя строка: поле ввода + кнопка отправки - выровнены по верхнему краю */}
              <div className="flex items-start gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. 15% of 2340"
                    rows={1}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12 resize-none overflow-y-auto min-h-[56px] max-h-[80px] leading-relaxed"
                    style={{ lineHeight: '1.5' }}
                  />
                  {inputText && (
                    <button
                      onClick={clearInput}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || loading}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl font-medium transition-all flex items-center justify-center ${inputText.trim() && !loading
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white hover:shadow-md'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <SendIcon />
                </button>
              </div>

              {/* Нижняя строка: микрофон на всю ширину */}
              <div className="w-full">
                <VoiceInput onResult={handleVoiceResult} isSquare={true} fullWidth={true} language={selectedLang}/>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}

            {/* Result Card - единая структура для всех типов */}
            {result && !loading && (
              <div className="mt-6 bg-white rounded-2xl pt-6 px-6 pb-1 border border-gray-200 shadow-sm relative">

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {(result.type === 'math' || result.type === 'reasoning') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        const iconContainer = btn.querySelector('.icon-container');
                        const originalContent = iconContainer?.innerHTML || '';

                        let textToCopy = `Your question: "${query}"\nAnswer: `;

                        if (result.type === 'math') {
                          textToCopy += `${result.result?.toLocaleString()} ${result.unit || ''}`;
                        } else if (result.type === 'reasoning') {
                          if (typeof result.answer === 'object') {
                            textToCopy += Object.entries(result.answer).map(([k, v]) => `${k}: ${v}`).join(', ');
                          } else {
                            textToCopy += result.answer;
                          }
                        }

                        textToCopy += `\n\nDetails:\n`;

                        if (result.type === 'math') {
                          textToCopy += `Expression: ${result.expression || ''}\n`;
                          if (result.steps) {
                            textToCopy += (result.steps as any[]).map(s => `${s.value} — ${s.meaning}`).join('\n');
                          }
                        } else if (result.type === 'reasoning') {
                          if (result.steps) {
                            textToCopy += (result.steps as string[]).join('\n');
                          }
                        }

                        textToCopy += `\n\nDescription: ${result.description || ''}\n\n— via AI Calculator (aicalculator.cloud)`;

                        navigator.clipboard.writeText(textToCopy);

                        if (iconContainer) {
                          iconContainer.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                          setTimeout(() => {
                            iconContainer.innerHTML = originalContent;
                          }, 1000);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy result"
                    >
                      <span className="icon-container block w-5 h-5">
                        <CopyIcon />
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setResult(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <span className="block w-5 h-5">
                      <CloseIcon />
                    </span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* YOUR QUESTION - всегда одинаково */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <span>📝</span> YOUR QUESTION
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap break-words">
                      <p className="text-gray-800 italic">&ldquo;{query}&rdquo;</p>
                    </div>
                  </div>

                  {/* ANSWER - для всех типов, но с разным наполнением */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <span>✅</span> ANSWER
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      {result.type === 'math' && (
                        <div className="text-center">
                          <span className="text-4xl font-light text-blue-600">
                            {result.result?.toLocaleString()} {result.unit || ''}
                          </span>
                        </div>
                      )}
                      {result.type === 'reasoning' && (
                        <div className="text-center">
                          <span className="text-4xl font-light text-blue-600">
                            {Array.isArray(result.answer)
                              ? result.answer.map(v => Number(v).toFixed(2)).join(', ')
                              : typeof result.answer === 'number'
                                ? result.answer.toFixed(2)
                                : typeof result.answer === 'object'
                                  ? Object.entries(result.answer)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' | ')
                                  : String(result.answer)}
                          </span>
                        </div>
                      )}
                      {result.type === 'calculated' && (
                        <p className="text-xl text-blue-700">{result.answer}</p>
                      )}
                      {result.type === 'unknown' && (
                        <p className="text-gray-700">{result.message || 'Could not understand your request'}</p>
                      )}
                    </div>
                  </div>

                  {/* DETAILS - для всех типов */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <span>🔍</span> DETAILS
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      {result.type === 'math' && (
                        <div className="space-y-3">
                          {result.expression && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Expression:</div>
                              <code className="block bg-white p-2 rounded border border-gray-200 text-sm font-mono overflow-x-auto">
                                {result.expression}
                              </code>
                            </div>
                          )}
                          {result.steps && result.steps.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500">Breakdown:</div>
                              {result.steps.map((step: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 text-sm border-l-2 border-blue-200 pl-3">
                                  <span className="font-mono text-blue-600 min-w-[80px]">{step.value}</span>
                                  <span className="text-gray-700">— {step.meaning}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {result.description && (
                            <div className="text-sm text-gray-700 pt-2 border-t border-gray-200">
                              {result.description}
                            </div>
                          )}
                        </div>
                      )}
                      {result.type === 'reasoning' && (
                        <div className="space-y-3">
                          {/* Если answer — объект, показываем его */}
                          {result.answer && typeof result.answer === 'object' && (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500">Answer breakdown:</div>
                              {Object.entries(result.answer).map(([key, value]) => (
                                <div key={key} className="text-sm border-l-2 border-blue-200 pl-3">
                                  <span className="text-gray-700">{key}: {String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Steps */}
                          {result.steps && result.steps.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500">Reasoning:</div>
                              {result.steps.map((step: any, idx: number) => {
                                if (typeof step === 'string') {
                                  return (
                                    <div key={idx} className="text-sm border-l-2 border-blue-200 pl-3">
                                      <span className="text-gray-700">{step}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}

                          {/* Description */}
                          {result.description && (
                            <div className="text-sm text-gray-700 pt-2 border-t border-gray-200">
                              {result.description}
                            </div>
                          )}
                        </div>
                      )}
                      {result.type === 'calculated' && (
                        <p className="text-sm text-gray-600">{result.details}</p>
                      )}
                      {result.type === 'unknown' && (
                        <p className="text-sm text-gray-500">
                          {query.match(/[а-яА-Я]/)
                            ? 'Попробуйте: "15% от 2340", "√25", "ипотека 10 млн"'
                            : 'Try: "15% of 2340", "√25", "mortgage 500k"'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DISCLAIMER - мелким шрифтом внизу */}
                  <div className="text-center text-xs text-gray-400">
                    <p>AI-generated. For reference only.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Example Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {exampleCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => handleVoiceResult(card.query)}
                className={`w-full text-left p-5 rounded-xl border transition-all ${getColorClass(card.color)}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</h3>
                </div>
                <div className="text-sm text-gray-600 italic">
                  "{card.query}"
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-8">
            <p>⚡ Voice-powered · Natural language · AI inside ⚡</p>
            <p className="mt-4">© 2026 AI Calculator — smart and simple.</p>
          </div>
        </div>
      </div>
    </main>
  );
}