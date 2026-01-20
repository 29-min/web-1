'use client';

import { FileText, Instagram, MessageCircle, Linkedin, Twitter, Clock, Coffee } from 'lucide-react';

interface CalendarItem {
  day: string;
  dayEn: string;
  channel: string | null;
  channelName: string;
  time: string;
  reason: string;
}

interface WeeklyCalendarProps {
  calendarData: string;
}

const CHANNEL_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string; bgColor: string }> = {
  blog: { icon: FileText, color: 'text-green-600', bgColor: 'bg-green-100' },
  instagram: { icon: Instagram, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  threads: { icon: MessageCircle, color: 'text-gray-700', bgColor: 'bg-gray-200' },
  linkedin: { icon: Linkedin, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  twitter: { icon: Twitter, color: 'text-gray-900', bgColor: 'bg-gray-100' },
};

export default function WeeklyCalendar({ calendarData }: WeeklyCalendarProps) {
  // JSON 파싱 시도
  let schedule: CalendarItem[] = [];
  
  try {
    // JSON 배열 추출 (앞뒤 텍스트 제거)
    const jsonMatch = calendarData.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      schedule = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('캘린더 파싱 실패:', e);
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
        캘린더 데이터를 파싱할 수 없습니다.
      </div>
    );
  }

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📅 주간 발행 캘린더
        </h3>
        <p className="text-blue-100 text-sm mt-1">최적의 시간에 콘텐츠를 발행하세요</p>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {schedule.map((item, index) => {
          const config = item.channel ? CHANNEL_CONFIG[item.channel] : null;
          const Icon = config?.icon || Coffee;
          const isWeekend = item.dayEn === 'saturday' || item.dayEn === 'sunday';
          
          return (
            <div
              key={item.dayEn}
              className={`bg-white p-3 min-h-[160px] flex flex-col ${
                isWeekend ? 'bg-gray-50' : ''
              }`}
            >
              {/* 요일 헤더 */}
              <div className={`text-center pb-2 border-b mb-3 ${
                isWeekend ? 'text-red-500' : 'text-gray-700'
              }`}>
                <div className="font-bold text-lg">{item.day}</div>
                <div className="text-xs text-gray-400 capitalize">{item.dayEn}</div>
              </div>
              
              {/* 콘텐츠 */}
              {item.channel ? (
                <div className="flex-1 flex flex-col">
                  {/* 채널 배지 */}
                  <div className={`${config?.bgColor} rounded-lg p-2 mb-2`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${config?.color}`} />
                      <span className={`text-sm font-medium ${config?.color}`}>
                        {item.channelName}
                      </span>
                    </div>
                  </div>
                  
                  {/* 시간 */}
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{item.time}</span>
                  </div>
                  
                  {/* 이유 */}
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">
                    {item.reason}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <Coffee className="w-6 h-6 mb-1" />
                  <span className="text-xs">휴식</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 범례 */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(CHANNEL_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${config.bgColor}`} />
                <Icon className={`w-3 h-3 ${config.color}`} />
                <span className="text-gray-600 capitalize">{key}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
