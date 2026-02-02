'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Wand2, Youtube } from 'lucide-react';

const navItems = [
    { href: '/', label: '홈', icon: Home },
    { href: '/repurpose', label: '콘텐츠 변환', icon: FileText },
    { href: '/youtube-transcript', label: '유튜브', icon: Youtube },
    { href: '/extract-prompt', label: '프롬프트', icon: Wand2 },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
