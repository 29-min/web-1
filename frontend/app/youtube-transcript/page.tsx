'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Play, Copy, Check, Loader2, FileText, RefreshCw } from 'lucide-react';
import {
    searchYouTubeVideos,
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

    // Search videos
    const handleSearch = async () => {
        if (!keyword.trim()) return;

        setLoading(true);
        setError('');
        setVideos([]);
        setSelectedVideo(null);
        setTranscript(null);

        try {
            const result = await searchYouTubeVideos({
                keyword: keyword.trim(),
                top_n: 10,
                exclude_shorts: true,
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

    // Reload transcript with/without timestamps
    const handleReloadTranscript = async () => {
        if (!selectedVideo) return;
        handleGetTranscript(selectedVideo);
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

    // Effect to reload transcript when timestamp toggle changes
    useEffect(() => {
        if (selectedVideo && transcript) {
            handleReloadTranscript();
        }
    }, [includeTimestamps]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>메인으로 돌아가기</span>
                </Link>

                {/* Header */}
                <header className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-6">
                        <span className="text-4xl mr-3">📺</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600">
                            유튜브 대본 추출기
                        </h1>
                    </div>
                    <p className="text-slate-600">
                        인기 YouTube 영상을 검색하고 스크립트를 추출하세요
                    </p>
                </header>

                {/* Search Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="검색 키워드를 입력하세요 (예: Python 강의, 요리 레시피)"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading || !keyword.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            검색
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Video List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Play className="w-5 h-5 text-red-500" />
                            검색 결과 {videos.length > 0 && `(${videos.length}개)`}
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="bg-white/60 rounded-xl p-8 text-center text-slate-500">
                                키워드를 입력하고 검색하세요
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {videos.map((video, index) => (
                                    <div
                                        key={video.video_id}
                                        onClick={() => handleGetTranscript(video)}
                                        className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all border-2 ${selectedVideo?.video_id === video.video_id
                                                ? 'border-red-400 bg-red-50/50'
                                                : 'border-transparent hover:border-red-200'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 mb-1">
                                                    <span className="text-sm font-bold text-red-500">#{index + 1}</span>
                                                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{video.title}</h3>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2">{video.channel_title}</p>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                                                        👁️ {video.view_count.toLocaleString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">
                                                        ⭐ {video.quality_score}점
                                                    </span>
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
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-pink-500" />
                            대본 추출
                        </h2>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 min-h-[500px]">
                            {!selectedVideo ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16">
                                    <span className="text-4xl mb-4">📝</span>
                                    <p>영상을 선택하면 대본이 표시됩니다</p>
                                </div>
                            ) : transcriptLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-4" />
                                    <p className="text-slate-600">스크립트를 불러오는 중...</p>
                                </div>
                            ) : transcriptError ? (
                                <div className="bg-red-50 rounded-xl p-6 text-center">
                                    <span className="text-3xl mb-2 block">⚠️</span>
                                    <p className="text-red-700">{transcriptError}</p>
                                </div>
                            ) : transcript ? (
                                <div className="space-y-4">
                                    {/* Video Info */}
                                    <div className="border-b border-slate-200 pb-4">
                                        <h3 className="font-semibold text-slate-800 mb-2">{selectedVideo.title}</h3>
                                        <div className="flex gap-4 text-sm text-slate-500">
                                            <span>🌐 {transcript.language}</span>
                                            <span>📊 {transcript.word_count} 단어</span>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={includeTimestamps}
                                                onChange={(e) => setIncludeTimestamps(e.target.checked)}
                                                className="rounded border-slate-300"
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
                                        className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm resize-none"
                                    />

                                    {/* Rewrite Panel */}
                                    {showRewrite && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                                            <h4 className="font-semibold text-slate-800 mb-4">✨ AI 스크립트 재구성</h4>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm text-slate-600 mb-1">스타일</label>
                                                    <select
                                                        value={rewriteStyle}
                                                        onChange={(e) => setRewriteStyle(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    >
                                                        <option value="informative">📚 정보 전달형</option>
                                                        <option value="entertaining">🎭 엔터테인먼트형</option>
                                                        <option value="educational">🎓 교육형</option>
                                                        <option value="conversational">💬 대화형</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-slate-600 mb-1">길이</label>
                                                    <select
                                                        value={rewriteLength}
                                                        onChange={(e) => setRewriteLength(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
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
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                />
                                            </div>
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
                                                    <>🚀 재구성 시작</>
                                                )}
                                            </button>

                                            {/* Rewritten Result */}
                                            {rewrittenScript && (
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold text-slate-700">📄 재구성된 스크립트</span>
                                                        <button
                                                            onClick={handleCopyRewrite}
                                                            className="px-3 py-1 text-xs bg-white rounded-lg flex items-center gap-1"
                                                        >
                                                            {rewriteCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                                            {rewriteCopied ? '복사됨!' : '복사'}
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={rewrittenScript}
                                                        readOnly
                                                        className="w-full h-48 p-4 bg-white rounded-xl border border-slate-200 text-sm resize-none"
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
