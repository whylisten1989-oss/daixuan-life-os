import { create } from "zustand";

type UiState = {
  amountsHidden: boolean;
  quickCreateOpen: boolean;
  toggleAmounts: () => void;
  setQuickCreateOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  amountsHidden: false,
  quickCreateOpen: false,
  toggleAmounts: () => set((state) => ({ amountsHidden: !state.amountsHidden })),
  setQuickCreateOpen: (quickCreateOpen) => set({ quickCreateOpen }),
}));
