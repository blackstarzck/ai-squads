import { create } from 'zustand';
import { PageContentState, PageContent, PageContentItem, SelectedPageContentRef } from '@/types';

const emptyPageContent = (): PageContent => ({
  prd: [],
  screenLayout: [],
  wireframe: [],
});

export const usePageContentStore = create<PageContentState>((set, get) => ({
  contents: {},
  selectedItem: null,

  addItem: (pageId: string, section: keyof PageContent, item: PageContentItem) => {
    set((state) => {
      const current = state.contents[pageId] ?? emptyPageContent();
      return {
        contents: {
          ...state.contents,
          [pageId]: {
            ...current,
            [section]: [...current[section], item],
          },
        },
      };
    });
  },

  removeItem: (pageId: string, section: keyof PageContent, itemId: string) => {
    set((state) => {
      const current = state.contents[pageId];
      if (!current) return state;
      // 삭제 대상이 현재 선택된 항목이면 선택 해제
      const sel = state.selectedItem;
      const shouldDeselect =
        sel && sel.pageId === pageId && sel.section === section && sel.itemId === itemId;
      return {
        contents: {
          ...state.contents,
          [pageId]: {
            ...current,
            [section]: current[section].filter((i) => i.id !== itemId),
          },
        },
        ...(shouldDeselect ? { selectedItem: null } : {}),
      };
    });
  },

  updateItem: (pageId: string, section: keyof PageContent, itemId: string, data: Partial<Pick<PageContentItem, 'label' | 'description'>>) => {
    set((state) => {
      const current = state.contents[pageId];
      if (!current) return state;
      return {
        contents: {
          ...state.contents,
          [pageId]: {
            ...current,
            [section]: current[section].map((i) =>
              i.id === itemId ? { ...i, ...data } : i
            ),
          },
        },
      };
    });
  },

  removePage: (pageId: string) => {
    set((state) => {
      const { [pageId]: _, ...rest } = state.contents;
      const shouldDeselect = state.selectedItem?.pageId === pageId;
      return {
        contents: rest,
        ...(shouldDeselect ? { selectedItem: null } : {}),
      };
    });
  },

  setSelectedItem: (ref: SelectedPageContentRef | null) => {
    set({ selectedItem: ref });
  },
}));
