import create from "zustand";

export const usePageStore = create((set) => ({
  pageLoading: false,
  setPageLoading: (loading) => set({ pageLoading: loading }),
}));
