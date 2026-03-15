// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import VoiceInput, { LanguageSelector } from './components/VoiceInput';


interface ResultData {
  type?: 'math' | 'calculated' | 'unknown' | 'reasoning';
  result?: number;
  unit?: string;
  expression?: string;
  steps?: Array<{ value: string; meaning: string }> | Array<string>;
  description?: string;
  answer?: number | string | Record<string, any>;
  details?: string;
  message?: string;
  error?: string;
  suggestion?: string;
}

// ── Icons ─────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

// ── Example cards data (вне компонента) ───────────────────
const EXAMPLE_CARDS = [
  {
    icon: '🏠',
    title: 'Mortgage & Loans',
    desc: 'Monthly payments, total interest and loan affordability.',
    query: 'Monthly payment on a $500k mortgage at 4% for 30 years?',
  },
  {
    icon: '💰',
    title: 'Taxes & Salary',
    desc: 'Net pay after tax in the USA, UK, Germany and more.',
    query: 'What is the net salary from $80k gross per year in the USA?',
  },
  {
    icon: '🏃',
    title: 'Workout & Nutrition',
    desc: 'Calories, BMI, protein intake and fitness calculations.',
    query: 'How many calories are in 200g of chicken breast?',
  },
  {
    icon: '🍽️',
    title: 'Tips & Percentages',
    desc: 'Tip calculator and bill splitting for any group size.',
    query: '20% tip on an $85 restaurant bill?',
  },
  {
    icon: '💶',
    title: 'Currency Converter',
    desc: 'Convert between dollars, euros, pounds, yen and more.',
    query: 'Convert 500 US dollars to euros',
  },
  {
    icon: '√',
    title: 'Math & Percentages',
    desc: 'Percentages, discounts, splits and everyday math.',
    query: 'What is 15% of 2340?',
  },
];

// ── ExampleCards ──────────────────────────────────────────
const ExampleCards = ({ onSelect }: { onSelect: (query: string) => void }) => (
  <section aria-label="Popular calculations" className="mt-6">
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">
      Popular Calculations
    </h2>
    <p className="text-xs text-gray-400 mb-4 px-2">
      Tap a category to see an example
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {EXAMPLE_CARDS.map((card) => (
        <button
          key={card.title}
          onClick={() => onSelect(card.query)}
          className="w-full text-left p-4 bg-white border border-gray-200 rounded-2xl transition-all hover:bg-blue-50 hover:border-blue-300 active:scale-98"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{card.icon}</span>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {card.title}
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-2 leading-relaxed">{card.desc}</p>
          <p className="text-xs text-gray-500 italic">&ldquo;{card.query}&rdquo;</p>
        </button>
      ))}
    </div>
  </section>
);

// ── InputCard ─────────────────────────────────────────────
const InputCard = ({
  inputText,
  setInputText,
  handleSubmit,
  loading,
  selectedLang,
  setSelectedLang,
  textareaRef,
}: any) => {
  const singleLineHRef = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    recalcHeight();
  }, [expanded]);

  useEffect(() => {
    if (!inputText) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const limit = getSingleLineH();
    requestAnimationFrame(() => {
      ta.style.height = 'auto';
      const sh = ta.scrollHeight;
      ta.style.height = `${sh}px`;
      if (sh > limit) setExpanded(true);
    });
  }, [inputText]);

  const getSingleLineH = (): number => {
    if (singleLineHRef.current !== null) return singleLineHRef.current;
    const ta = textareaRef.current;
    if (!ta) return 36;
    const savedValue = ta.value;
    const savedHeight = ta.style.height;
    ta.style.height = 'auto';
    ta.value = '';
    const h = ta.scrollHeight;
    ta.value = savedValue;
    ta.style.height = savedHeight;
    singleLineHRef.current = h;
    return h;
  };

  const recalcHeight = (): number => {
    const ta = textareaRef.current;
    if (!ta) return 0;
    const sel = ta.selectionStart;
    const selEnd = ta.selectionEnd;
    ta.style.height = 'auto';
    const sh = ta.scrollHeight;
    ta.style.height = `${sh}px`;
    try { ta.setSelectionRange(sel, selEnd); } catch (_) { }
    return sh;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    const limit = getSingleLineH();
    const sh = recalcHeight();
    if (!expanded && sh > limit) {
      setExpanded(true);
    } else if (expanded && value === '') {
      setExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !loading) handleSubmit();
    }
  };

  const handlePaste = () => {
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const limit = getSingleLineH();
      const sh = recalcHeight();
      if (!expanded && sh > limit) setExpanded(true);
    });
  };

  const clearInput = () => {
    setInputText('');
    setExpanded(false);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.focus();
    }
  };

  const canSend = inputText.trim().length > 0 && !loading;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-5 mb-3 relative">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          WHAT TO CALCULATE?
        </div>
        <div className="relative z-50">
          <LanguageSelector
            selectedLang={selectedLang}
            onLanguageChange={setSelectedLang}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {!expanded && (
          <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
            <span className="text-xl">➕</span>
          </button>
        )}
        <div className="flex-1 min-w-0 flex items-center">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="e.g. 15% of 2340"
            rows={1}
            className="w-full border-none focus:outline-none resize-none bg-transparent leading-relaxed text-base py-2"
            style={{ lineHeight: '24px', overflow: 'hidden', minHeight: '40px' }}
          />
        </div>
        {inputText && (
          <button
            onClick={clearInput}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
            title="Clear"
          >
            ✕
          </button>
        )}
        {!expanded && (
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${canSend ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
            title="Send"
          >
            <SendIcon />
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
          <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
            <span className="text-xl">➕</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${canSend ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
            title="Send"
          >
            <SendIcon />
          </button>
        </div>
      )}
    </div>
  );
};

// ── MicButton ─────────────────────────────────────────────
const MicButton = ({ onResult, selectedLang }: any) => (
  <div className="mb-3 flex flex-col items-center gap-1 w-full">
    <div className="w-full">
      <VoiceInput
        onResult={onResult}
        isSquare={true}
        fullWidth={true}
        language={selectedLang}
      />
    </div>
  </div>
);

// ── LoadingCard ───────────────────────────────────────────
const LoadingCard = () => (
  <div className="bg-white rounded-3xl shadow-lg p-5 mt-3">
    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
      CALCULATING...
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 rounded-full animate-shimmer" />
      </div>
      <div className="h-10 bg-gray-100 rounded-xl overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-100 via-purple-100 to-orange-100 rounded-xl animate-shimmer" />
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden w-3/4">
        <div className="h-full bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 rounded-full animate-shimmer" />
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden w-1/2">
        <div className="h-full bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 rounded-full animate-shimmer" />
      </div>
    </div>
  </div>
);

// ── ResultCard ────────────────────────────────────────────
const ResultCard = ({ result, query, setResult, loading }: any) => {
  if (loading) return null;
  if (!result) return null;

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

  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 mb-3 relative">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          RESULT
        </div>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1">
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
                textToCopy += Object.entries(result.answer as Record<string, any>).map(([k, v]) => `${k}: ${v}`).join(', ');
              } else {
                textToCopy += result.answer;
              }
            } else if (result.type === 'calculated') {
              textToCopy += result.answer;
            } else {
              textToCopy += result.message || '';
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
            } else if (result.type === 'calculated') {
              textToCopy += result.details || '';
            }

            if (result.description) { textToCopy += `\n\nDescription: ${result.description}`; }
            textToCopy += `\n\n aicalculator.cloud`;

            navigator.clipboard.writeText(textToCopy);

            if (iconContainer) {
              iconContainer.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
              setTimeout(() => { iconContainer.innerHTML = originalContent; }, 1000);
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Copy result"
        >
          <span className="icon-container block w-5 h-5">
            <CopyIcon />
          </span>
        </button>
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

      <div className="space-y-6 pt-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            <span>📝</span> YOUR QUESTION
          </div>
          <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap break-words">
            <p className="text-gray-800 italic">&ldquo;{query}&rdquo;</p>
          </div>
        </div>

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
                    ? result.answer.map((v: any) => Number(v).toFixed(2)).join(', ')
                    : typeof result.answer === 'number'
                      ? result.answer.toFixed(2)
                      : typeof result.answer === 'object'
                        ? Object.entries(result.answer).map(([k, v]) => `${k}: ${v}`).join(' | ')
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
                    {(result.steps as any[]).map((step: any, idx: number) => (
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
                {result.steps && result.steps.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Reasoning:</div>
                    {(result.steps as any[]).map((step: any, idx: number) => {
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

        <div className="text-center text-xs text-gray-400">
          <p>AI-generated. For reference only.</p>
        </div>
      </div>
    </div>
  );
};

// ── Home ──────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceResult = async (text: string) => {
    setQuery(text);
    setInputText(text);

    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.style.height = 'auto';
      const sh = ta.scrollHeight;
      ta.style.height = `${sh}px`;
    });

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ type: 'unknown', message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (inputText.trim()) handleVoiceResult(inputText.trim());
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'AI Calculator',
            'applicationCategory': 'UtilitiesApplication',
            'description': 'Free AI calculator for mortgage, salary, tip, BMI, currency conversion, percentages and more',
            'url': 'https://aicalculator.cloud',
            'offers': { '@type': 'Offer', 'price': '0' },
          }),
        }}
      />
      <main className="bg-gray-100" style={{ minHeight: '100dvh' }}>
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto px-4 pt-14 pb-6 max-w-3xl">

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  AI Calculator
                </h1>
              </div>
              <p className="text-gray-500 text-sm tracking-wide">
                ASK ANYTHING · CALCULATE INSTANTLY
              </p>
            </div>

            <InputCard
              inputText={inputText}
              setInputText={setInputText}
              handleSubmit={handleSubmit}
              loading={loading}
              selectedLang={selectedLang}
              setSelectedLang={setSelectedLang}
              textareaRef={textareaRef}
            />

            <MicButton
              onResult={handleVoiceResult}
              selectedLang={selectedLang}
            />

            {loading && <LoadingCard />}
            <ResultCard
              result={result}
              query={query}
              setResult={setResult}
              loading={loading}
            />

            <ExampleCards
              onSelect={(q) => {
                setInputText(q);
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                    const len = textareaRef.current.value.length;
                    textareaRef.current.setSelectionRange(len, len);
                  }
                }, 50);
              }}
            />

            <div className="text-center text-xs text-gray-400 mt-8">
              <p>⚡ Voice-powered · Natural language · AI inside ⚡</p>
              <p className="mt-4">© 2026 AI Calculator — smart and simple.</p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}