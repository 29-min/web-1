'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Play, Copy, Check, Loader2, FileText, RefreshCw, Filter, ChevronDown, ChevronUp, Youtube, X, ExternalLink } from 'lucide-react';
import {
    searchYouTubeVideos,
    getTrendingVideos,
    getTranscript,
    rewriteScript,
    YouTubeVideo,
    TranscriptResponse,
} from '@/lib/api';

type FilterTab = 'basic' | 'advanced' | 'weights';

export default function YouTubeTranscriptPage() {
    const [keyword, setKeyword] = useState('');
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Filter UI state
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('basic');

    // Filter values
    const [shortsFilter, setShortsFilter] = useState<'all' | 'shorts-only' | 'exclude-shorts'>('exclude-shorts');
    const [language, setLanguage] = useState('ko');
    const [durationFilter, setDurationFilter] = useState('any');
    const [uploadPeriod, setUploadPeriod] = useState('any');
    const [trendingMode, setTrendingMode] = useState(false);
    const [minViews, setMinViews] = useState(0);
    const [viewsWeight, setViewsWeight] = useState(35);
    const [engagementWeight, setEngagementWeight] = useState(40);
    const [recencyWeight, setRecencyWeight] = useState(25);

    // Transcript modal state
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [showTranscriptModal, setShowTranscriptModal] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
    const [transcriptLoading, setTranscriptLoading] = useState(false);
    const [transcriptError, setTranscriptError] = useState('');
    const [includeTimestamps, setIncludeTimestamps] = useState(false);
    const [copied, setCopied] = useState(false);

    // Rewrite state
    const [showRewrite, setShowRewrite] = useState(false);
    const [rewriteStyle, setRewriteStyle] = useState('informative');
    const [rewriteLength, setRewriteLength] = useState('similar');
    const [rewriteInstructions, setRewriteInstructions] = useState('');
    const [rewriteLoading, setRewriteLoading] = useState(false);
    const [rewrittenScript, setRewrittenScript] = useState('');
    const [rewriteCopied, setRewriteCopied] = useState(false);

    useEffect(() => {
        loadTrendingVideos();
    }, []);

    const loadTrendingVideos = async () => {
        setLoading(true);
        setError('');
        setIsInitialLoad(true);
        try {
            const result = await getTrendingVideos(10);
            setVideos(result.videos);
        } catch (err) {
            console.log('Trending load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!keyword.trim()) return;
        setLoading(true);
        setError('');
        setVideos([]);
        setIsInitialLoad(false);

        try {
            const result = await searchYouTubeVideos({
                keyword: keyword.trim(),
                top_n: 10,
                shorts_only: shortsFilter === 'shorts-only',
                exclude_shorts: shortsFilter === 'exclude-shorts',
                duration_filter: durationFilter,
                upload_period: uploadPeriod,
                language: language,
                trending_mode: trendingMode,
                min_views: minViews,
            });
            setVideos(result.videos);
        } catch (err) {
            setError(err instanceof Error ? err.message : '검색 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = async (video: YouTubeVideo) => {
        setSelectedVideo(video);
        setShowTranscriptModal(true);
        setTranscriptLoading(true);
        setTranscriptError('');
        setTranscript(null);
        setShowRewrite(false);
        setRewrittenScript('');

        try {
            const result = await getTranscript(video.video_id, 'ko', includeTimestamps);
            setTranscript(result);
        } catch (err) {
            setTranscriptError(err instanceof Error ? err.message : '대본 추출 실패');
        } finally {
            setTranscriptLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!transcript?.text) return;
        await navigator.clipboard.writeText(transcript.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRewrite = async () => {
        if (!transcript?.text) return;
        setRewriteLoading(true);
        try {
            const result = await rewriteScript(transcript.text, rewriteStyle, rewriteLength, rewriteInstructions);
            setRewrittenScript(result.rewritten_script);
        } catch (err) {
            setTranscriptError(err instanceof Error ? err.message : 'AI 재구성 실패');
        } finally {
            setRewriteLoading(false);
        }
    };

    const handleCopyRewrite = async () => {
        if (!rewrittenScript) return;
        await navigator.clipboard.writeText(rewrittenScript);
        setRewriteCopied(true);
        setTimeout(() => setRewriteCopied(false), 2000);
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (shortsFilter !== 'all') count++;
        if (language !== 'any') count++;
        if (durationFilter !== 'any') count++;
        if (uploadPeriod !== 'any') count++;
        if (trendingMode) count++;
        if (minViews > 0) count++;
        return count;
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">메인으로</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Youtube className="w-8 h-8 text-red-500" />
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800">YouTube 콘텐츠 플래너</h1>
                    </div>
                    <div className="w-20" /> {/* Spacer for centering */}
                </header>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div className="flex gap-3 mb-3">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="검색 키워드 입력 (예: Python 강의, 요리 레시피)"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading || !keyword.trim()}
                            className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-md"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            <span className="hidden sm:inline">검색</span>
                        </button>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>필터 옵션</span>
                        {getActiveFilterCount() > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-semibold">
                                {getActiveFilterCount()}
                            </span>
                        )}
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Filter Panel with Tabs */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            {/* Tab Navigation */}
                            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-4">
                                {[
                                    { key: 'basic', label: '기본 필터' },
                                    { key: 'advanced', label: '고급 필터' },
                                    { key: 'weights', label: '가중치' },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveFilterTab(tab.key as FilterTab)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilterTab === tab.key
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Basic Filters */}
                            {activeFilterTab === 'basic' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">콘텐츠 타입</label>
                                        <select
                                            value={shortsFilter}
                                            onChange={(e) => setShortsFilter(e.target.value as any)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        >
                                            <option value="all">전체</option>
                                            <option value="shorts-only">쇼츠만</option>
                                            <option value="exclude-shorts">쇼츠 제외</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">언어/지역</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        >
                                            <option value="any">전체</option>
                                            <option value="ko">🇰🇷 한국어</option>
                                            <option value="en">🇺🇸 영어</option>
                                            <option value="ja">🇯🇵 일본어</option>
                                            <option value="zh">🇨🇳 중국어</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Advanced Filters */}
                            {activeFilterTab === 'advanced' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">영상 길이</label>
                                        <select
                                            value={durationFilter}
                                            onChange={(e) => setDurationFilter(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        >
                                            <option value="any">전체</option>
                                            <option value="short">짧은 (&lt;4분)</option>
                                            <option value="medium">중간 (4-20분)</option>
                                            <option value="long">긴 (&gt;20분)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">업로드 기간</label>
                                        <select
                                            value={uploadPeriod}
                                            onChange={(e) => setUploadPeriod(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        >
                                            <option value="any">전체</option>
                                            <option value="day">오늘</option>
                                            <option value="week">이번 주</option>
                                            <option value="month">이번 달</option>
                                            <option value="year">올해</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">최소 조회수</label>
                                        <input
                                            type="number"
                                            value={minViews}
                                            onChange={(e) => setMinViews(Number(e.target.value))}
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 w-full">
                                            <input
                                                type="checkbox"
                                                checked={trendingMode}
                                                onChange={(e) => setTrendingMode(e.target.checked)}
                                                className="accent-red-500"
                                            />
                                            <span className="text-sm">🔥 트렌딩 모드</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Weight Sliders */}
                            {activeFilterTab === 'weights' && (
                                <div className="space-y-4 max-w-md">
                                    <p className="text-xs text-slate-500 mb-2">영상 품질 점수 계산에 사용되는 가중치를 조절하세요.</p>
                                    {[
                                        { label: '조회수', value: viewsWeight, setter: setViewsWeight },
                                        { label: '참여율 (좋아요+댓글)', value: engagementWeight, setter: setEngagementWeight },
                                        { label: '최신성', value: recencyWeight, setter: setRecencyWeight },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">{item.label}</span>
                                                <span className="text-red-500 font-semibold">{item.value}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={item.value}
                                                onChange={(e) => item.setter(Number(e.target.value))}
                                                className="w-full accent-red-500 h-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {isInitialLoad ? '🔥 오늘의 인기 영상' : '🏆 검색 결과'}
                        {videos.length > 0 && (
                            <span className="text-sm font-normal text-slate-500">({videos.length}개)</span>
                        )}
                    </h2>
                </div>

                {/* Video Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                        <p className="text-slate-600">{isInitialLoad ? '인기 영상을 불러오는 중...' : '검색 중...'}</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
                        <span className="text-5xl mb-4 block">🔍</span>
                        <p>키워드를 입력하고 검색하세요</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map((video, index) => (
                            <div
                                key={video.video_id}
                                onClick={() => handleVideoClick(video)}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer transition-all hover:shadow-lg hover:border-red-200 hover:-translate-y-1"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-lg text-sm font-bold shadow">
                                        {index + 1}
                                    </div>
                                    {video.is_shorts && (
                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold">
                                            SHORTS
                                        </span>
                                    )}
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                                        {video.duration}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1 leading-tight">
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-2 truncate">{video.channel_title}</p>
                                    <div className="flex flex-wrap gap-1.5 text-xs">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                                            👁️ {video.view_count.toLocaleString()}
                                        </span>
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">
                                            ⭐ {video.quality_score}
                                        </span>
                                        {video.views_per_day > 0 && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded">
                                                🔥 {Math.round(video.views_per_day).toLocaleString()}/일
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transcript Modal */}
                {showTranscriptModal && selectedVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowTranscriptModal(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between p-4 border-b border-slate-200">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="font-bold text-slate-800 line-clamp-2">{selectedVideo.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{selectedVideo.channel_title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedVideo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => setShowTranscriptModal(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {transcriptLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                                        <p className="text-slate-600">스크립트를 불러오는 중...</p>
                                    </div>
                                ) : transcriptError ? (
                                    <div className="bg-red-50 rounded-xl p-6 text-center">
                                        <span className="text-4xl mb-2 block">⚠️</span>
                                        <p className="text-red-700">{transcriptError}</p>
                                    </div>
                                ) : transcript ? (
                                    <div className="space-y-4">
                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>🌐 {transcript.language === 'ko' ? '한국어' : transcript.language}</span>
                                            <span>📊 {transcript.word_count.toLocaleString()} 단어</span>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                                <input
                                                    type="checkbox"
                                                    checked={includeTimestamps}
                                                    onChange={(e) => {
                                                        setIncludeTimestamps(e.target.checked);
                                                        handleVideoClick(selectedVideo);
                                                    }}
                                                    className="accent-red-500"
                                                />
                                                타임스탬프 포함
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCopy}
                                                    className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? '복사됨!' : '복사'}
                                                </button>
                                                <button
                                                    onClick={() => setShowRewrite(!showRewrite)}
                                                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-1"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    AI 재구성
                                                </button>
                                            </div>
                                        </div>

                                        {/* Transcript Text */}
                                        <textarea
                                            value={transcript.text}
                                            readOnly
                                            className="w-full h-56 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 resize-none"
                                        />

                                        {/* Rewrite Panel */}
                                        {showRewrite && (
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                                <h4 className="font-semibold text-slate-800 mb-3">✨ AI 스크립트 재구성</h4>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <select
                                                        value={rewriteStyle}
                                                        onChange={(e) => setRewriteStyle(e.target.value)}
                                                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    >
                                                        <option value="informative">📚 정보 전달형</option>
                                                        <option value="entertaining">🎭 엔터테인먼트형</option>
                                                        <option value="educational">🎓 교육형</option>
                                                        <option value="conversational">💬 대화형</option>
                                                    </select>
                                                    <select
                                                        value={rewriteLength}
                                                        onChange={(e) => setRewriteLength(e.target.value)}
                                                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    >
                                                        <option value="shorter">짧게 (30% 요약)</option>
                                                        <option value="similar">비슷하게</option>
                                                        <option value="longer">길게 (30% 확장)</option>
                                                    </select>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="추가 지시사항 (예: 더 친근한 말투로)"
                                                    value={rewriteInstructions}
                                                    onChange={(e) => setRewriteInstructions(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-3"
                                                />
                                                <button
                                                    onClick={handleRewrite}
                                                    disabled={rewriteLoading}
                                                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {rewriteLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            AI가 재구성 중...
                                                        </>
                                                    ) : (
                                                        '🚀 재구성 시작'
                                                    )}
                                                </button>

                                                {rewrittenScript && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-semibold text-slate-700">📄 재구성된 스크립트</span>
                                                            <button
                                                                onClick={handleCopyRewrite}
                                                                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded flex items-center gap-1"
                                                            >
                                                                {rewriteCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                                                {rewriteCopied ? '복사됨!' : '복사'}
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={rewrittenScript}
                                                            readOnly
                                                            className="w-full h-48 p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 resize-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
