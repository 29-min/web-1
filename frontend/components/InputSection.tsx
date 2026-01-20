import React from 'react';
import { Link, Loader2, Sparkles, FileText, Globe } from 'lucide-react';

interface InputSectionProps {
    inputType: 'url' | 'text';
    setInputType: (type: 'url' | 'text') => void;
    url: string;
    setUrl: (url: string) => void;
    textContent: string;
    setTextContent: (text: string) => void;
    handleScrape: () => void;
    isScrapingLoading: boolean;
    scrapedContent: string | null;
    scrapedTitle: string | null;
    error?: string | null;
}

export default function InputSection({
    inputType,
    setInputType,
    url,
    setUrl,
    textContent,
    setTextContent,
    handleScrape,
    isScrapingLoading,
    scrapedContent,
    scrapedTitle,
    error
}: InputSectionProps) {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 overflow-hidden">
            <div className="p-5 space-y-4">
                {/* Header & Toggle */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 p-1 rounded-md">
                            {inputType === 'url' ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </span>
                        입력
                    </h2>

                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setInputType('url')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${inputType === 'url'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            URL
                        </button>
                        <button
                            onClick={() => setInputType('text')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${inputType === 'text'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            텍스트
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {inputType === 'url' ? (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://blog.naver.com/..."
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                            />
                            <button
                                onClick={handleScrape}
                                disabled={!url || isScrapingLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm whitespace-nowrap"
                            >
                                {isScrapingLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Link className="w-4 h-4" />
                                )}
                                추출
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {scrapedContent && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {scrapedTitle && (
                                    <div className="flex items-start gap-2 mb-2 p-2 bg-blue-50/50 text-blue-800 rounded-lg border border-blue-100/50">
                                        <span className="text-sm">📌</span>
                                        <p className="font-medium text-xs line-clamp-1">{scrapedTitle}</p>
                                    </div>
                                )}
                                <div className="relative">
                                    <textarea
                                        value={scrapedContent}
                                        readOnly
                                        className="w-full h-32 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-600 resize-none focus:outline-none"
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] bg-white/80 backdrop-blur px-1.5 py-0.5 rounded border text-slate-400 shadow-sm">
                                        {scrapedContent.length.toLocaleString()}자
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                            <textarea
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="변환할 내용을 직접 입력하세요..."
                                className="w-full h-48 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm"
                            />
                            {textContent && (
                                <div className="absolute bottom-2 right-2 text-[10px] bg-white/80 backdrop-blur px-1.5 py-0.5 rounded border text-slate-400 shadow-sm">
                                    {textContent.length.toLocaleString()}자
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
