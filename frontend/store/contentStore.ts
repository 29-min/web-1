import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedContent {
    id: string;
    channel: string;
    channelName: string;
    content: string;
    createdAt: string;
}

interface ContentStore {
    // 현재 카드 생성에 사용할 콘텐츠
    currentContent: string | null;
    currentChannel: string | null;

    // 저장된 콘텐츠 목록
    savedContents: SavedContent[];

    // Actions
    setCurrentContent: (content: string, channel?: string) => void;
    clearCurrentContent: () => void;
    addSavedContent: (content: SavedContent) => void;
    removeSavedContent: (id: string) => void;
    clearAllSavedContents: () => void;
}

export const useContentStore = create<ContentStore>()(
    persist(
        (set) => ({
            currentContent: null,
            currentChannel: null,
            savedContents: [],

            setCurrentContent: (content, channel) => set({
                currentContent: content,
                currentChannel: channel || null
            }),

            clearCurrentContent: () => set({
                currentContent: null,
                currentChannel: null
            }),

            addSavedContent: (content) => set((state) => ({
                savedContents: [content, ...state.savedContents].slice(0, 50) // 최대 50개 저장
            })),

            removeSavedContent: (id) => set((state) => ({
                savedContents: state.savedContents.filter((c) => c.id !== id)
            })),

            clearAllSavedContents: () => set({ savedContents: [] }),
        }),
        {
            name: 'content-storage', // localStorage key
        }
    )
);
