'use client';

import { useState, useRef, useEffect } from 'react';
import { Wand2, Loader2, Copy, Check, Link as LinkIcon, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface StyleAnalysis {
    tone: string;
    vocabulary: string;
    sentence_style: string;
    structure: string;
    generated_prompt: string;
}

// 분석 단계별 메시지 (약 30초 동안 순환)
const ANALYSIS_STEPS = [
    { message: '📄 블로그 콘텐츠 추출 중...', duration: 2000 },
    { message: '✅ 콘텐츠 추출 완료!', duration: 1000 },
    { message: '🔍 AI가 글의 전체적인 톤앤매너를 분석하고 있습니다...', duration: 4000 },
    { message: '📝 어휘 스타일과 자주 사용하는 표현을 파악하고 있습니다...', duration: 5000 },
    { message: '✍️ 문장 구조와 리듬을 분석하고 있습니다...', duration: 4000 },
    { message: '🏗️ 글의 전체적인 구조 패턴을 파악하고 있습니다...', duration: 5000 },
    { message: '🎨 스타일 특성을 종합하고 있습니다...', duration: 4000 },
    { message: '✨ 맞춤 프롬프트를 생성하고 있습니다...', duration: 5000 },
    { message: '🔄 최종 검토 중...', duration: 3000 },
];

export default function ExtractPromptPage() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<StyleAnalysis | null>(null);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 가짜 진행 상태 애니메이션
    const startFakeProgress = () => {
        let stepIndex = 0;
        let totalElapsed = 0;
        const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0);

        const updateStatus = () => {
            if (stepIndex < ANALYSIS_STEPS.length) {
                const step = ANALYSIS_STEPS[stepIndex];
                setStatus(step.message);
                totalElapsed += step.duration;
                setProgress(Math.min(95, (totalElapsed / totalDuration) * 100));
                stepIndex++;

                if (stepIndex < ANALYSIS_STEPS.length) {
                    statusIntervalRef.current = setTimeout(updateStatus, step.duration);
                }
            }
        };

        updateStatus();
    };

    const stopFakeProgress = () => {
        if (statusIntervalRef.current) {
            clearTimeout(statusIntervalRef.current);
            statusIntervalRef.current = null;
        }
    };

    const handleAnalyze = async () => {
        if (!url) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);
        startFakeProgress();

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-style`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '분석에 실패했습니다. URL을 확인해주세요.');
            }

            const data = await response.json();

            stopFakeProgress();
            setStatus('🎉 분석 완료!');
            setProgress(100);
            setResult(data);

        } catch (err) {
            stopFakeProgress();
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopFakeProgress();
    }, []);

    const handleCopy = async () => {
        if (!result?.generated_prompt) return;
        await navigator.clipboard.writeText(result.generated_prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <header className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center justify-center p-2 bg-white rounded-2xl shadow-sm mb-2">
                        <Wand2 className="w-6 h-6 text-amber-500 mr-2" />
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
                            프롬프트 추출기
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
                        블로그 URL을 입력하면 글의 톤앤매너를 분석하여<br className="hidden md:block" />
                        동일한 스타일로 글을 쓸 수 있는 프롬프트를 생성합니다
                    </p>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left Column: Input */}
                    <div className="space-y-6">
                        {/* URL Input */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-5">
                            <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                <span className="bg-amber-100 text-amber-600 p-1 rounded-md">
                                    <LinkIcon className="w-3.5 h-3.5" />
                                </span>
                                분석할 블로그 URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://blog.naver.com/..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-sm"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!url || isLoading}
                                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-5 h-5" />
                                    )}
                                    분석
                                </button>
                            </div>

                            {/* Progress Bar & Status */}
                            {isLoading && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>{status}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Style Analysis Results */}
                        {result && (
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-5 animate-in fade-in slide-in-from-bottom-2">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 p-1 rounded-md">
                                        <Wand2 className="w-3.5 h-3.5" />
                                    </span>
                                    분석 결과
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs font-semibold text-amber-600 block mb-1">톤앤매너</span>
                                        <p className="text-sm text-slate-700">{result.tone}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-amber-600 block mb-1">어휘 스타일</span>
                                        <p className="text-sm text-slate-700">{result.vocabulary}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-amber-600 block mb-1">문장 스타일</span>
                                        <p className="text-sm text-slate-700">{result.sentence_style}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-amber-600 block mb-1">구조</span>
                                        <p className="text-sm text-slate-700">{result.structure}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Generated Prompt */}
                    <div className="lg:sticky lg:top-6">
                        {result?.generated_prompt ? (
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-amber-100 overflow-hidden animate-in fade-in slide-in-from-right-2">
                                <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <span className="text-lg">📝</span>
                                        생성된 프롬프트
                                    </h3>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-50 transition shadow-sm"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                                <span className="text-green-600">복사됨!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                복사
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-4">
                                    <textarea
                                        value={result.generated_prompt}
                                        readOnly
                                        className="w-full h-80 p-4 border border-slate-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono text-sm leading-relaxed text-slate-700"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                    {isLoading ? (
                                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-8 h-8 text-amber-400" />
                                    )}
                                </div>
                                <p className="font-medium whitespace-pre-line">
                                    {isLoading ? status : '블로그 URL을 분석하면\n프롬프트가 여기에 나타납니다'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
