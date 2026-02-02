'use client';

import Link from 'next/link';
import { Sparkles, FileText, Wand2, ArrowRight, Youtube } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <header className="text-center py-16 md:py-24">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-6">
            <span className="text-4xl mr-3">✨</span>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Content Studio
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AI 기반 콘텐츠 도구 모음<br />
            블로그 글을 SNS로 변환하거나, 원하는 스타일의 프롬프트를 추출하거나, 유튜브 대본을 가져오세요
          </p>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Content Repurposer Card */}
          <Link href="/repurpose" className="group">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-violet-200">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                콘텐츠 변환기
                <ArrowRight className="w-5 h-5 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                블로그 글을 <strong className="text-violet-600">인스타그램</strong>, <strong className="text-indigo-600">스레드</strong> 등 SNS 콘텐츠로 자동 변환합니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">Instagram</span>
                <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-semibold">Threads</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Blog</span>
              </div>
            </div>
          </Link>

          {/* Prompt Extractor Card */}
          <Link href="/extract-prompt" className="group">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-amber-200">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                <Wand2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                프롬프트 추출기
                <ArrowRight className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                블로그 URL을 입력하면 해당 글의 <strong className="text-amber-600">톤앤매너</strong>를 분석하여 동일한 스타일로 글을 쓸 수 있는 프롬프트를 생성합니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">AI 분석</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">톤앤매너</span>
              </div>
            </div>
          </Link>

          {/* YouTube Transcript Card */}
          <Link href="/youtube-transcript" className="group">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-red-200">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                유튜브 대본 추출기
                <ArrowRight className="w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                인기 YouTube 영상을 검색하고 <strong className="text-red-600">대본/스크립트</strong>를 추출합니다. <strong className="text-pink-600">AI 재구성</strong>도 가능!
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">YouTube</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">스크립트</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">AI 재구성</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center py-12 mt-12 text-slate-400 text-sm">
          Made with ❤️ in Korea
        </footer>
      </div>
    </main>
  );
}
