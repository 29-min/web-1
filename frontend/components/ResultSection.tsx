import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CHANNELS } from '@/lib/constants';
import { TransformResult } from '@/lib/api';
import { Sparkles, Loader2, Copy, Check, FileText, LayoutTemplate, Edit2, Save, RotateCcw, Image } from 'lucide-react';
import WeeklyCalendar from './WeeklyCalendar';
import { useContentStore } from '@/store/contentStore';

interface ResultSectionProps {
    results: TransformResult[];
    setResults: React.Dispatch<React.SetStateAction<TransformResult[]>>;
    calendar: string | null;
    activeTab: number;
    setActiveTab: (index: number) => void;
    handleCopy: (content: string, index: number) => void;
    copiedIndex: number | null;
    isTransformLoading: boolean;
    progress: { current: number; total: number; status: string };
    error: string | null;
    handleTransform: () => void;
    currentContent: string | null;
    selectedChannels: string[];
}

export default function ResultSection({
    results,
    setResults,
    calendar,
    activeTab,
    setActiveTab,
    handleCopy,
    copiedIndex,
    isTransformLoading,
    progress,
    error,
    handleTransform,
    currentContent,
    selectedChannels,
}: ResultSectionProps) {

    const router = useRouter();
    const { setCurrentContent } = useContentStore();

    const [viewMode, setViewMode] = useState<'text' | 'preview'>('text');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    // 카드로 만들기
    const handleMakeCard = () => {
        if (results[activeTab]) {
            setCurrentContent(results[activeTab].content, results[activeTab].channel);
            router.push('/card-generator');
        }
    };

    // Handle tab change and reset states
    const onTabChange = (index: number) => {
        setActiveTab(index);
        setViewMode('text');
        setIsEditing(false);
        setEditedContent('');
    };

    // Start editing
    const startEditing = () => {
        if (results[activeTab]) {
            setEditedContent(results[activeTab].content);
            setIsEditing(true);
        }
    };

    // Save edits
    const saveEdits = () => {
        setResults(prev => {
            const newResults = [...prev];
            newResults[activeTab] = {
                ...newResults[activeTab],
                content: editedContent
            };
            return newResults;
        });
        setIsEditing(false);
    };

    // Cancel edits
    const cancelEdits = () => {
        setIsEditing(false);
        setEditedContent('');
    };

    const activeResult = results[activeTab];
    const isInstagram = activeResult?.channel === 'instagram';

    // Parse content for preview (simple paragraph split for now)
    const previewSlides = activeResult?.content
        .split(/\n\s*\n/)
        .filter(slide => slide.trim().length > 0) || [];

    return (
        <div className="space-y-6 sticky top-8">
            {/* Action Button */}
            <button
                onClick={handleTransform}
                disabled={!currentContent || selectedChannels.length === 0 || isTransformLoading}
                className="group w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 transition-all active:scale-[0.98]"
            >
                {isTransformLoading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="animate-pulse">{progress.status}</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        변환 시작
                    </>
                )}
            </button>

            {/* Loading Progress */}
            {isTransformLoading && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-3">
                        <span>{progress.status}</span>
                        <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in shake">
                    <span className="text-xl">❌</span>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Results Display */}
            {results.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px] transition-all">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-xl">📤</span> 결과
                        </h2>
                        {isInstagram && (
                            <div className="flex bg-gray-200 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('text')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'text' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> 텍스트
                                    </div>
                                </button>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'preview' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <LayoutTemplate className="w-3 h-3" /> 카드 미리보기
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar bg-white">
                        {results.map((result, index) => {
                            const channel = CHANNELS.find(c => c.key === result.channel);
                            const Icon = channel?.icon || FileText;
                            const isActive = activeTab === index;
                            return (
                                <button
                                    key={result.channel}
                                    onClick={() => onTabChange(index)}
                                    className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all relative ${isActive
                                        ? `text-gray-900 bg-gray-50/50`
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? channel?.text : ''}`} />
                                    {result.channel_name}
                                    {isActive && (
                                        <div className={`absolute bottom-0 left-0 w-full h-0.5 ${channel?.color}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-5 overflow-hidden flex flex-col bg-gray-50/30">
                        {viewMode === 'text' ? (
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                        {activeResult?.char_count.toLocaleString()}자
                                    </span>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={saveEdits}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition shadow-sm"
                                                >
                                                    <Save className="w-3 h-3" /> 저장
                                                </button>
                                                <button
                                                    onClick={cancelEdits}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-bold hover:bg-gray-600 transition shadow-sm"
                                                >
                                                    <RotateCcw className="w-3 h-3" /> 취소
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={startEditing}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition shadow-sm"
                                            >
                                                <Edit2 className="w-3 h-3" /> 수정
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleCopy(activeResult?.content || '', activeTab)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition shadow-sm"
                                        >
                                            {copiedIndex === activeTab ? (
                                                <>
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    <span className="text-green-600">복사됨</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" /> 복사
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleMakeCard}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg text-xs font-bold hover:opacity-90 transition shadow-sm"
                                        >
                                            <Image className="w-3 h-3" /> 카드로 만들기
                                        </button>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full flex-1 p-4 border-2 border-blue-500 rounded-xl bg-white resize-none focus:outline-none font-mono text-sm leading-relaxed shadow-inner"
                                    />
                                ) : (
                                    <textarea
                                        value={activeResult?.content || ''}
                                        readOnly
                                        className="w-full h-full p-4 border border-gray-200 rounded-xl bg-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 font-mono text-sm leading-relaxed text-gray-700"
                                    />
                                )}
                            </div>
                        ) : (
                            /* Slide Preview */
                            <div className="h-full overflow-y-auto custom-scrollbar p-2">
                                <div className="grid grid-cols-1 gap-4">
                                    {previewSlides.map((slide, i) => (
                                        <div key={i} className="aspect-square bg-white border border-gray-100 shadow-md rounded-xl p-6 flex flex-col justify-center items-center text-center hover:shadow-xl transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500" />
                                            <span className="absolute top-4 left-4 text-xs font-bold text-gray-300">
                                                {i + 1}/{previewSlides.length}
                                            </span>
                                            <p className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed">
                                                {slide}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Calendar */}
            {calendar && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <WeeklyCalendar calendarData={calendar} />
                </div>
            )}

            {/* Empty State */}
            {results.length === 0 && !isTransformLoading && (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-medium">콘텐츠를 변환하면 여기에 결과가 나타납니다</p>
                </div>
            )}
        </div>
    );
}
