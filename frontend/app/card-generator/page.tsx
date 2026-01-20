'use client';

import { useState, useRef, useEffect } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Image, Download, Palette, Type, AlignLeft, AlignCenter, Loader2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

// 카드 템플릿 정의
const TEMPLATES = [
    {
        id: 'minimal',
        name: '미니멀',
        bg: 'bg-white',
        text: 'text-gray-800',
        style: { background: '#ffffff' }
    },
    {
        id: 'gradient',
        name: '그라데이션',
        bg: 'bg-gradient-to-br from-violet-500 to-pink-500',
        text: 'text-white',
        style: { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }
    },
    {
        id: 'warm',
        name: '감성',
        bg: 'bg-gradient-to-br from-amber-100 to-orange-100',
        text: 'text-amber-900',
        style: { background: 'linear-gradient(135deg, #fef3c7, #ffedd5)' }
    },
    {
        id: 'dark',
        name: '다크',
        bg: 'bg-gray-900',
        text: 'text-white',
        style: { background: '#111827' }
    },
];

const FONT_SIZES = [
    { id: 'sm', name: '작게', class: 'text-lg', px: 18 },
    { id: 'md', name: '보통', class: 'text-xl', px: 20 },
    { id: 'lg', name: '크게', class: 'text-2xl', px: 24 },
];

const TEXT_ALIGNS = [
    { id: 'left', name: '왼쪽', class: 'text-left', icon: AlignLeft },
    { id: 'center', name: '가운데', class: 'text-center', icon: AlignCenter },
];

export default function CardGeneratorPage() {
    const { currentContent, currentChannel, clearCurrentContent } = useContentStore();
    const [content, setContent] = useState('');
    const [template, setTemplate] = useState(TEMPLATES[0]);
    const [fontSize, setFontSize] = useState(FONT_SIZES[1]);
    const [textAlign, setTextAlign] = useState(TEXT_ALIGNS[1]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // 저장된 콘텐츠 로드
    useEffect(() => {
        if (currentContent) {
            setContent(currentContent);
        }
    }, [currentContent]);

    // 슬라이드로 분할 (단락 기준)
    const slides = content
        .split(/\n\s*\n/)
        .filter(s => s.trim().length > 0)
        .map(s => s.trim());

    const handleDownload = async () => {
        if (!cardRef.current || slides.length === 0) return;

        setIsDownloading(true);

        try {
            // 각 슬라이드를 이미지로 변환
            const cardElements = cardRef.current.querySelectorAll('.card-slide');

            for (let i = 0; i < cardElements.length; i++) {
                const element = cardElements[i] as HTMLElement;
                const canvas = await html2canvas(element, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true,
                });

                const link = document.createElement('a');
                link.download = `card-${i + 1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                // 약간의 딜레이
                await new Promise(r => setTimeout(r, 300));
            }

            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 2000);
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/repurpose" className="p-2 hover:bg-white/50 rounded-xl transition">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div className="inline-flex items-center p-2 bg-white rounded-2xl shadow-sm">
                            <Image className="w-6 h-6 text-pink-500 mr-2" />
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
                                카드뉴스 생성기
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading || slides.length === 0}
                        className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 font-bold shadow-lg shadow-pink-500/20 transition-all active:scale-95"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : downloaded ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                        {downloaded ? '완료!' : `다운로드 (${slides.length}장)`}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Settings */}
                    <div className="space-y-4">
                        {/* Text Input */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-4">
                            <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                <Type className="w-4 h-4 text-pink-500" />
                                텍스트 입력
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="카드에 들어갈 텍스트를 입력하세요.&#10;&#10;빈 줄로 슬라이드를 구분합니다."
                                className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-sm"
                            />
                            <p className="text-xs text-slate-400 mt-2">빈 줄로 슬라이드를 나눕니다</p>
                        </div>

                        {/* Template Selection */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-4">
                            <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                <Palette className="w-4 h-4 text-pink-500" />
                                템플릿
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTemplate(t)}
                                        className={`aspect-square rounded-xl ${t.bg} border-2 transition-all ${template.id === t.id ? 'border-pink-500 scale-105' : 'border-transparent'
                                            }`}
                                        title={t.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Font Size */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-4">
                            <label className="text-sm font-bold text-slate-800 mb-3 block">글자 크기</label>
                            <div className="flex gap-2">
                                {FONT_SIZES.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFontSize(f)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${fontSize.id === f.id
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Align */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-4">
                            <label className="text-sm font-bold text-slate-800 mb-3 block">정렬</label>
                            <div className="flex gap-2">
                                {TEXT_ALIGNS.map((a) => {
                                    const Icon = a.icon;
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => setTextAlign(a)}
                                            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center transition-all ${textAlign.id === a.id
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">미리보기</h3>

                            {slides.length === 0 ? (
                                <div className="aspect-square max-w-md mx-auto bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                    <p className="text-center">텍스트를 입력하면<br />미리보기가 나타납니다</p>
                                </div>
                            ) : (
                                <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                                    {slides.map((slide, i) => (
                                        <div
                                            key={i}
                                            className={`card-slide aspect-square rounded-xl p-8 flex items-center justify-center ${template.bg}`}
                                            style={{ ...template.style, width: '100%' }}
                                        >
                                            <p className={`${template.text} ${fontSize.class} ${textAlign.class} leading-relaxed whitespace-pre-wrap font-medium`}>
                                                {slide}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
