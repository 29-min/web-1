import React from 'react';
import { CHANNELS, TONES, TARGETS } from '@/lib/constants';
import { Sparkles, Sliders } from 'lucide-react';

interface SettingsSectionProps {
    selectedChannels: string[];
    toggleChannel: (channelKey: string) => void;
    settings: {
        tone: string;
        target: string;
        emojiLevel: number;
    };
    setSettings: React.Dispatch<React.SetStateAction<{
        tone: string;
        target: string;
        emojiLevel: number;
    }>>;
    customizePrompts: boolean;
    setCustomizePrompts: (customize: boolean) => void;
    customInstruction?: string; // Optional if not used directly
    setCustomInstruction?: (instruction: string) => void; // Optional
}

export default function SettingsSection({
    selectedChannels,
    toggleChannel,
    settings,
    setSettings,
    customizePrompts,
    setCustomizePrompts,
}: SettingsSectionProps) {

    // Helper to update settings
    const updateSetting = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Prompt logic is handled in the parent page for now to keep state lifted, 
    // or we can implement local state if we want to fetch prompts here.
    // For this compact view, we'll assume the parent passes down what's needed 
    // or we add the logic back if it was fully encapsulated.
    // Looking at previous valid code, this component managed fetching prompts itself 
    // or just the UI toggle. Let's stick to the UI structure first.

    // Actually, `page.tsx` now manages `customPrompts` logic or might expect this component to do it.
    // Based on `page.tsx` props, it passes `customInstruction` but `SettingsSection` logic 
    // in previous turns showed it handling a lot of prompt state locally or via props that might be missing in `page.tsx`.
    // Let's re-align with `page.tsx`'s expectation. `page.tsx` passes:
    // selectedChannels, toggleChannel, settings, setSettings, customizePrompts, setCustomizePrompts, customInstruction, setCustomInstruction

    // Wait, `page.tsx` doesn't seem to pass `customPrompts` map or `loadDefaultPrompts`. 
    // The previous `SettingsSection` had `loadDefaultPrompts` and `customPrompts` state.
    // If I removed those from `page.tsx`, I need to restore them here if I want this component to handle it,
    // OR this component handles it internally.
    // The previous working version had `activePromptTab`, `customPrompts` state INSIDE SettingsSection?
    // Let's check the artifacts. `page.tsx` has `customPrompts` state? 
    // No, `page.tsx` in recent edits didn't seem to have `customPrompts` state passed down.
    // It seems `SettingsSection` was handling the prompt fetching logic internally in the verfication step.

    // I will restore the internal state for prompt management since it's UI-heavy.

    const [activePromptTab, setActivePromptTab] = React.useState(0);
    const [customPrompts, setCustomPrompts] = React.useState<Record<string, string>>({});
    const [loadingPrompts, setLoadingPrompts] = React.useState(false);

    // Load prompts when toggle is enabled or channels change
    React.useEffect(() => {
        if (customizePrompts && selectedChannels.length > 0) {
            loadDefaultPrompts();
        }
    }, [customizePrompts, selectedChannels.length]); // Re-load if added new channel

    const loadDefaultPrompts = async () => {
        setLoadingPrompts(true);
        const newPrompts = { ...customPrompts };

        for (const channel of selectedChannels) {
            if (!newPrompts[channel]) {
                try {
                    const res = await fetch(`http://localhost:8000/prompts/${channel}`);
                    if (res.ok) {
                        const data = await res.json();
                        newPrompts[channel] = data.prompt;
                    }
                } catch (error) {
                    console.error("Failed to fetch prompt", error);
                }
            }
        }
        setCustomPrompts(newPrompts);
        setLoadingPrompts(false);
    };

    const resetPrompt = async (channel: string) => {
        try {
            const res = await fetch(`http://localhost:8000/prompts/${channel}`);
            if (res.ok) {
                const data = await res.json();
                setCustomPrompts(prev => ({ ...prev, [channel]: data.prompt }));
            }
        } catch (error) {
            console.error("Failed to reset prompt", error);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 overflow-hidden">
            <div className="p-5 space-y-5">
                {/* Channel Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 p-1 rounded-md">
                            <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        채널 선택
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {CHANNELS.map((channel) => {
                            const Icon = channel.icon;
                            const isSelected = selectedChannels.includes(channel.key);
                            return (
                                <button
                                    key={channel.key}
                                    onClick={() => toggleChannel(channel.key)}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 border ${isSelected
                                        ? `${channel.color} text-white border-transparent shadow-sm scale-[1.02]`
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {channel.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Style Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-600 p-1 rounded-md">
                            <Sliders className="w-3.5 h-3.5" />
                        </span>
                        스타일 설정
                    </label>

                    <div className="space-y-4">
                        {/* Tone */}
                        <div>
                            <div className="flex flex-wrap gap-1.5">
                                {TONES.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => updateSetting('tone', t.key)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${settings.tone === t.key
                                            ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target */}
                        <div>
                            <div className="flex flex-wrap gap-1.5">
                                {TARGETS.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => updateSetting('target', t.key)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${settings.target === t.key
                                            ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Emoji Level */}
                        <div className=" bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-slate-700">이모지 강도</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600">
                                    {['없음', '적당히', '많이', '폭격'][settings.emojiLevel]}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="3"
                                value={settings.emojiLevel}
                                onChange={(e) => updateSetting('emojiLevel', Number(e.target.value))}
                                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Prompt Settings Toggle */}
                <div className="pt-4 border-t border-slate-100">
                    <div
                        onClick={() => setCustomizePrompts(!customizePrompts)}
                        className="flex items-center justify-between cursor-pointer group select-none"
                    >
                        <span className="text-xs font-bold text-slate-600 group-hover:text-purple-600 transition-colors">
                            상세 프롬프트 설정
                        </span>
                        <div className={`w-9 h-5 flex items-center bg-slate-200 rounded-full p-1 duration-300 ease-in-out ${customizePrompts ? 'bg-purple-500' : ''}`}>
                            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform duration-300 ease-in-out ${customizePrompts ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>

                    {customizePrompts && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            {selectedChannels.length === 0 ? (
                                <div className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    채널을 먼저 선택해주세요
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                                        {selectedChannels.map((channelKey, index) => {
                                            const channel = CHANNELS.find(c => c.key === channelKey);
                                            return (
                                                <button
                                                    key={channelKey}
                                                    onClick={() => setActivePromptTab(index)}
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all ${activePromptTab === index
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                                        }`}
                                                >
                                                    {channel?.name}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {selectedChannels[activePromptTab] && (
                                        <div className="relative">
                                            <textarea
                                                value={customPrompts[selectedChannels[activePromptTab]] || (loadingPrompts ? "로딩 중..." : "")}
                                                onChange={(e) => setCustomPrompts(prev => ({
                                                    ...prev,
                                                    [selectedChannels[activePromptTab]]: e.target.value
                                                }))}
                                                className="w-full h-32 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-mono leading-relaxed bg-white resize-none"
                                                placeholder="프롬프트를 입력하세요..."
                                            />
                                            <button
                                                onClick={() => resetPrompt(selectedChannels[activePromptTab])}
                                                className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors"
                                            >
                                                초기화
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
