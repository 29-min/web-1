'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Play, Copy, Check, Loader2, FileText, RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import {
    searchYouTubeVideos,
    getTrendingVideos,
    getTranscript,
    rewriteScript,
    YouTubeVideo,
    TranscriptResponse,
} from '@/lib/api';

export default function YouTubeTranscriptPage() {
    const [keyword, setKeyword] = useState('');
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [shortsFilter, setShortsFilter] = useState<'all' | 'shorts-only' | 'exclude-shorts'>('exclude-shorts');
    const [durationFilter, setDurationFilter] = useState('any');
    const [uploadPeriod, setUploadPeriod] = useState('any');
    const [language, setLanguage] = useState('ko');
    const [trendingMode, setTrendingMode] = useState(false);
    const [minViews, setMinViews] = useState(0);

    // Weight sliders
    const [viewsWeight, setViewsWeight] = useState(35);
    const [engagementWeight, setEngagementWeight] = useState(40);
    const [recencyWeight, setRecencyWeight] = useState(25);

    // Transcript state
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
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

    // Load trending videos on mount
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
            // Trending might fail without API key, that's OK
            console.log('Trending load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search videos
    const handleSearch = async () => {
        if (!keyword.trim()) return;

        setLoading(true);
        setError('');
        setVideos([]);
        setSelectedVideo(null);
        setTranscript(null);
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

    // Get transcript
    const handleGetTranscript = async (video: YouTubeVideo) => {
        setSelectedVideo(video);
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

    // Copy transcript
    const handleCopy = async () => {
        if (!transcript?.text) return;
        await navigator.clipboard.writeText(transcript.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle rewrite
    const handleRewrite = async () => {
        if (!transcript?.text) return;

        setRewriteLoading(true);

        try {
            const result = await rewriteScript(
                transcript.text,
                rewriteStyle,
                rewriteLength,
                rewriteInstructions
            );
            setRewrittenScript(result.rewritten_script);
        } catch (err) {
            setTranscriptError(err instanceof Error ? err.message : 'AI 재구성 실패');
        } finally {
            setRewriteLoading(false);
        }
    };

    // Copy rewritten script
    const handleCopyRewrite = async () => {
        if (!rewrittenScript) return;
        await navigator.clipboard.writeText(rewrittenScript);
        setRewriteCopied(true);
        setTimeout(() => setRewriteCopied(false), 2000);
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (shortsFilter !== 'all') count++;
        if (durationFilter !== 'any') count++;
        if (uploadPeriod !== 'any') count++;
        if (language !== 'any') count++;
        if (trendingMode) count++;
        if (minViews > 0) count++;
        return count;
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>메인으로 돌아가기</span>
                </Link>

                {/* Header */}
                <header className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl border border-red-500/30 mb-4">
                        <span className="text-4xl mr-3">📊</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400">
                            YouTube 콘텐츠 플래너
                        </h1>
                        <span className="ml-3 px-2 py-0.5 bg-red-500/30 rounded text-xs text-red-300">v2.3</span>
                    </div>
                    <p className="text-slate-400">
                        인기 영상 분석 및 AI 스크립트 재구성 도구
                    </p>
                </header>

                {/* Search Section */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6">
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="검색 키워드를 입력하세요 (예: Python 강의, 요리 레시피)"
                            className="flex-1 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-white placeholder:text-slate-500"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading || !keyword.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/25"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            분석하기
                        </button>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>🎛️ 필터 옵션</span>
                        {getActiveFilterCount() > 0 && (
                            <span className="px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full text-xs">
                                {getActiveFilterCount()}
                            </span>
                        )}
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {/* 콘텐츠 타입 */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">📹 콘텐츠 타입</h4>
                                <div className="space-y-1">
                                    {[
                                        { value: 'all', label: '전체' },
                                        { value: 'shorts-only', label: '쇼츠만' },
                                        { value: 'exclude-shorts', label: '쇼츠 제외' },
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white">
                                            <input
                                                type="radio"
                                                name="shorts-filter"
                                                checked={shortsFilter === option.value}
                                                onChange={() => setShortsFilter(option.value as any)}
                                                className="accent-red-500"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 영상 길이 */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">⏱️ 영상 길이</h4>
                                <div className="space-y-1">
                                    {[
                                        { value: 'any', label: '전체' },
                                        { value: 'short', label: '짧은 영상 (<4분)' },
                                        { value: 'medium', label: '중간 (4-20분)' },
                                        { value: 'long', label: '긴 영상 (>20분)' },
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white">
                                            <input
                                                type="radio"
                                                name="duration-filter"
                                                checked={durationFilter === option.value}
                                                onChange={() => setDurationFilter(option.value)}
                                                className="accent-red-500"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 업로드 기간 */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">📅 업로드 기간</h4>
                                <div className="space-y-1">
                                    {[
                                        { value: 'any', label: '전체' },
                                        { value: 'day', label: '오늘' },
                                        { value: 'week', label: '이번 주' },
                                        { value: 'month', label: '이번 달' },
                                        { value: 'year', label: '올해' },
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white">
                                            <input
                                                type="radio"
                                                name="upload-period"
                                                checked={uploadPeriod === option.value}
                                                onChange={() => setUploadPeriod(option.value)}
                                                className="accent-red-500"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 언어/지역 */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">🌐 언어/지역</h4>
                                <div className="space-y-1">
                                    {[
                                        { value: 'any', label: '전체' },
                                        { value: 'ko', label: '🇰🇷 한국어' },
                                        { value: 'en', label: '🇺🇸 영어' },
                                        { value: 'ja', label: '🇯🇵 일본어' },
                                        { value: 'zh', label: '🇨🇳 중국어' },
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white">
                                            <input
                                                type="radio"
                                                name="language"
                                                checked={language === option.value}
                                                onChange={() => setLanguage(option.value)}
                                                className="accent-red-500"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 가중치 조절 */}
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3">⚖️ 점수 가중치 조절</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>조회수</span>
                                            <span className="text-red-400">{viewsWeight}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={viewsWeight}
                                            onChange={(e) => setViewsWeight(Number(e.target.value))}
                                            className="w-full accent-red-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>참여율 (좋아요+댓글)</span>
                                            <span className="text-red-400">{engagementWeight}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={engagementWeight}
                                            onChange={(e) => setEngagementWeight(Number(e.target.value))}
                                            className="w-full accent-red-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>최신성</span>
                                            <span className="text-red-400">{recencyWeight}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={recencyWeight}
                                            onChange={(e) => setRecencyWeight(Number(e.target.value))}
                                            className="w-full accent-red-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 특수 모드 & 최소 조회수 */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">🔥 특수 모드</h4>
                                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white mb-4">
                                    <input
                                        type="checkbox"
                                        checked={trendingMode}
                                        onChange={(e) => setTrendingMode(e.target.checked)}
                                        className="accent-red-500"
                                    />
                                    트렌딩 모드 (일일 조회수 기준)
                                </label>

                                <h4 className="text-sm font-semibold text-slate-300 mb-2">👁️ 최소 조회수</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={minViews}
                                        onChange={(e) => setMinViews(Number(e.target.value))}
                                        min="0"
                                        className="w-32 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-700 text-white text-sm"
                                    />
                                    <span className="text-sm text-slate-400">회 이상</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
                        ⚠️ {error}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Video List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Play className="w-5 h-5 text-red-500" />
                            {isInitialLoad ? '🔥 오늘의 인기 영상' : `🏆 검색 결과`}
                            {videos.length > 0 && <span className="text-slate-400 font-normal text-sm">({videos.length}개)</span>}
                        </h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                                <p className="text-slate-400">{isInitialLoad ? '오늘의 인기 영상을 불러오는 중...' : '영상을 검색하는 중...'}</p>
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="bg-slate-800/30 rounded-xl p-8 text-center text-slate-500 border border-slate-700/30">
                                <span className="text-4xl mb-4 block">🔍</span>
                                <p>키워드를 입력하고 검색하세요</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                                {videos.map((video, index) => (
                                    <div
                                        key={video.video_id}
                                        onClick={() => handleGetTranscript(video)}
                                        className={`bg-slate-800/50 rounded-xl p-4 cursor-pointer transition-all border ${selectedVideo?.video_id === video.video_id
                                                ? 'border-red-500 bg-red-500/10'
                                                : 'border-slate-700/50 hover:border-red-500/50 hover:bg-slate-800/80'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-40 h-24 object-cover rounded-lg"
                                                />
                                                {video.is_shorts && (
                                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded font-semibold">
                                                        SHORTS
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 mb-1">
                                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 rounded text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <h3 className="font-semibold text-white text-sm line-clamp-2">{video.title}</h3>
                                                </div>
                                                <p className="text-xs text-slate-400 mb-2">{video.channel_title}</p>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="px-2 py-0.5 bg-slate-700/50 rounded-full text-slate-300">
                                                        👁️ {video.view_count.toLocaleString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-slate-700/50 rounded-full text-slate-300">
                                                        👍 {video.like_count.toLocaleString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 font-semibold">
                                                        ⭐ {video.quality_score}점
                                                    </span>
                                                    {video.views_per_day > 0 && (
                                                        <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400">
                                                            🔥 {Math.round(video.views_per_day).toLocaleString()}/일
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Transcript Panel */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-pink-500" />
                            대본 추출
                        </h2>

                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 min-h-[600px]">
                            {!selectedVideo ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16">
                                    <span className="text-5xl mb-4">📝</span>
                                    <p>영상을 선택하면 대본이 표시됩니다</p>
                                </div>
                            ) : transcriptLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-4" />
                                    <p className="text-slate-400">스크립트를 불러오는 중...</p>
                                </div>
                            ) : transcriptError ? (
                                <div className="bg-red-500/10 rounded-xl p-6 text-center border border-red-500/30">
                                    <span className="text-4xl mb-2 block">⚠️</span>
                                    <p className="text-red-400">{transcriptError}</p>
                                </div>
                            ) : transcript ? (
                                <div className="space-y-4">
                                    {/* Video Info */}
                                    <div className="border-b border-slate-700/50 pb-4">
                                        <h3 className="font-semibold text-white mb-2 line-clamp-2">{selectedVideo.title}</h3>
                                        <div className="flex gap-4 text-sm text-slate-400">
                                            <span>🌐 {transcript.language === 'ko' ? '한국어' : transcript.language}</span>
                                            <span>📊 {transcript.word_count.toLocaleString()} 단어</span>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400">
                                            <input
                                                type="checkbox"
                                                checked={includeTimestamps}
                                                onChange={(e) => {
                                                    setIncludeTimestamps(e.target.checked);
                                                    if (selectedVideo) handleGetTranscript(selectedVideo);
                                                }}
                                                className="accent-pink-500"
                                            />
                                            타임스탬프 포함
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCopy}
                                                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                {copied ? '복사됨!' : '복사'}
                                            </button>
                                            <button
                                                onClick={() => setShowRewrite(!showRewrite)}
                                                className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-1"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                ✨ AI로 재구성
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transcript Text */}
                                    <textarea
                                        value={transcript.text}
                                        readOnly
                                        className="w-full h-48 p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-sm text-slate-300 resize-none"
                                    />

                                    {/* Rewrite Panel */}
                                    {showRewrite && (
                                        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
                                            <h4 className="font-semibold text-white mb-4">✨ AI 스크립트 재구성</h4>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm text-slate-400 mb-1">스타일</label>
                                                    <select
                                                        value={rewriteStyle}
                                                        onChange={(e) => setRewriteStyle(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700 text-sm text-white"
                                                    >
                                                        <option value="informative">📚 정보 전달형</option>
                                                        <option value="entertaining">🎭 엔터테인먼트형</option>
                                                        <option value="educational">🎓 교육형</option>
                                                        <option value="conversational">💬 대화형</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-slate-400 mb-1">길이</label>
                                                    <select
                                                        value={rewriteLength}
                                                        onChange={(e) => setRewriteLength(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700 text-sm text-white"
                                                    >
                                                        <option value="shorter">짧게 (30% 요약)</option>
                                                        <option value="similar">비슷하게</option>
                                                        <option value="longer">길게 (30% 확장)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="추가 지시사항 (예: 더 친근한 말투로)"
                                                    value={rewriteInstructions}
                                                    onChange={(e) => setRewriteInstructions(e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700 text-sm text-white placeholder:text-slate-500"
                                                />
                                            </div>
                                            <button
                                                onClick={handleRewrite}
                                                disabled={rewriteLoading}
                                                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {rewriteLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        AI가 재구성 중...
                                                    </>
                                                ) : (
                                                    <>🚀 재구성 시작</>
                                                )}
                                            </button>

                                            {/* Rewritten Result */}
                                            {rewrittenScript && (
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold text-white">📄 재구성된 스크립트</span>
                                                        <button
                                                            onClick={handleCopyRewrite}
                                                            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1"
                                                        >
                                                            {rewriteCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                            {rewriteCopied ? '복사됨!' : '복사'}
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={rewrittenScript}
                                                        readOnly
                                                        className="w-full h-48 p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-sm text-slate-300 resize-none"
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
            </div>
        </main>
    );
}
