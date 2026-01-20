
import {
  FileText,
  Instagram,
  MessageCircle,
  Linkedin,
  Twitter
} from 'lucide-react';

export const CHANNELS = [
  { key: 'blog', name: '블로그', icon: FileText, color: 'bg-green-500', text: 'text-green-500' },
  { key: 'instagram', name: '인스타그램', icon: Instagram, color: 'bg-pink-500', text: 'text-pink-500' },
  { key: 'threads', name: '스레드', icon: MessageCircle, color: 'bg-gray-800', text: 'text-gray-800' },
  { key: 'linkedin', name: '링크드인', icon: Linkedin, color: 'bg-blue-600', text: 'text-blue-600' },
  { key: 'twitter', name: 'X', icon: Twitter, color: 'bg-black', text: 'text-black' },
];

export const TONES = [
  { key: '전문적', label: '전문적 🎩' },
  { key: '캐주얼', label: '캐주얼 😊' },
  { key: '친근한', label: '친근한 🤗' },
  { key: '유머러스', label: '유머러스 😄' },
  { key: '격식체', label: '격식체 📜' },
];

export const TARGETS = [
  { key: '일반 대중', label: '일반 대중' },
  { key: '전문가/업계 종사자', label: '전문가' },
  { key: '초보자/입문자', label: '초보자' },
  { key: 'MZ세대 (20-30대)', label: 'MZ세대' },
  { key: '비즈니스/직장인', label: '비즈니스' },
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
