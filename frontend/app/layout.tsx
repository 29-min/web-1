import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Content Studio - AI 콘텐츠 도구',
  description: 'AI 기반 콘텐츠 변환 및 프롬프트 추출 도구',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased pb-20">
        {children}
        <Navbar />
      </body>
    </html>
  )
}

