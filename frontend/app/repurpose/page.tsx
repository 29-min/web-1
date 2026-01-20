'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { scrapeUrl, transformContent, TransformResult, StyleConfig, getChannelPrompt } from '@/lib/api';
import InputSection from '@/components/InputSection';
import SettingsSection from '@/components/SettingsSection';
import ResultSection from '@/components/ResultSection';

export default function Home() {
  // 입력 상태
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);
  const [scrapedTitle, setScrapedTitle] = useState<string | null>(null);

  // 설정 상태
  const [selectedChannels, setSelectedChannels] = useState(['blog', 'instagram', 'threads']);
  const [settings, setSettings] = useState({
    tone: '캐주얼',
    target: '일반 대중',
    emojiLevel: 1,
  });

  // 프롬프트 커스터마이징 상태
  const [customizePrompts, setCustomizePrompts] = useState(false);
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const [defaultPrompts, setDefaultPrompts] = useState<Record<string, string>>({});
  const [activePromptTab, setActivePromptTab] = useState(0);

  // 결과 상태
  const [results, setResults] = useState<TransformResult[]>([]);
  const [calendar, setCalendar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 로딩 상태
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isTransformLoading, setIsTransformLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url) return;

    setIsScrapingLoading(true);
    setError(null);

    try {
      const result = await scrapeUrl(url);
      setScrapedContent(result.content);
      setScrapedTitle(result.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : '추출 실패');
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleTransform = async () => {
    const content = inputType === 'url' ? scrapedContent : textContent;
    if (!content || selectedChannels.length === 0) return;

    setIsTransformLoading(true);
    setError(null);
    setResults([]);
    setProgress({ current: 0, total: selectedChannels.length + 1, status: '변환 준비 중...' });

    try {
      const styleConfig: StyleConfig = {
        tone: settings.tone,
        target: settings.target,
        emoji_level: settings.emojiLevel,
        custom: '',
      };

      setProgress({ current: 1, total: selectedChannels.length + 1, status: '콘텐츠 변환 중...' });

      // 커스텀 프롬프트가 활성화되어 있으면 전달
      const promptsToUse = customizePrompts ? customPrompts : undefined;

      const response = await transformContent(content, selectedChannels, styleConfig, promptsToUse);

      setResults(response.results);
      setCalendar(response.calendar);
      setActiveTab(0);
      setProgress({ current: selectedChannels.length + 1, total: selectedChannels.length + 1, status: '완료!' });
    } catch (err) {
      setError(err instanceof Error ? err.message : '변환 실패');
    } finally {
      setIsTransformLoading(false);
    }
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 기본 프롬프트 로드
  const loadDefaultPrompts = async () => {
    const prompts: Record<string, string> = {};
    for (const channel of selectedChannels) {
      try {
        const promptInfo = await getChannelPrompt(channel);
        prompts[channel] = promptInfo.prompt;
      } catch (err) {
        console.error(`Failed to load prompt for ${channel}:`, err);
      }
    }
    setDefaultPrompts(prompts);
    setCustomPrompts(prompts);
  };

  // 프롬프트 초기화
  const resetPrompt = (channel: string) => {
    setCustomPrompts(prev => ({
      ...prev,
      [channel]: defaultPrompts[channel] || ''
    }));
  };

  const currentContent = inputType === 'url' ? scrapedContent : textContent;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-2xl shadow-sm mb-2">
            <span className="text-2xl mr-2">✨</span>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Content Repurposer
            </h1>
          </div>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
            블로그 글을 인스타그램/스레드 콘텐츠로 한 번에 변환하세요
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Input & Settings */}
          <div className="space-y-6">
            <InputSection
              inputType={inputType}
              setInputType={setInputType}
              url={url}
              setUrl={setUrl}
              textContent={textContent}
              setTextContent={setTextContent}
              handleScrape={handleScrape}
              isScrapingLoading={isScrapingLoading}
              scrapedContent={scrapedContent}
              scrapedTitle={scrapedTitle}
            />

            <SettingsSection
              selectedChannels={selectedChannels}
              toggleChannel={(key) => {
                setSelectedChannels(prev =>
                  prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                );
              }}
              settings={settings}
              setSettings={setSettings}
              customizePrompts={customizePrompts}
              setCustomizePrompts={setCustomizePrompts}
            />
          </div>

          {/* 오른쪽: 결과 영역 */}
          <div className="lg:pl-4">
            <ResultSection
              results={results}
              setResults={setResults}
              calendar={calendar}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleCopy={handleCopy}
              copiedIndex={copiedIndex}
              isTransformLoading={isTransformLoading}
              progress={progress}
              error={error}
              handleTransform={handleTransform}
              currentContent={currentContent}
              selectedChannels={selectedChannels}
            />
          </div>
        </div>

        {/* 푸터 */}
        <footer className="text-center py-12 text-gray-400 text-sm font-medium">
          Made with ❤️ in Korea
        </footer>
      </div>
    </main>
  );
}
