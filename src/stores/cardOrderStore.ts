import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";

type OrderState = {
  courses: string[];
  cards: Record<string, string[]>;
  notebooks: Record<string, string[]>;
  setNotebooks: (courseId: string, ids: string[]) => void;
  setCourses: (ids: string[]) => void;
  setCards: (deckId: string, ids: string[]) => void;
};
const read = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
};
const ids = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
    : [];
export function createCardOrderStore(accountId: string) {
  const legacyCards = read(`folio:card-order:${accountId}`);
  return createStore<OrderState>()(
    persist(
      (set) => ({
        courses: ids(read(`folio:course-order:${accountId}`)),
        cards:
          legacyCards &&
          typeof legacyCards === "object" &&
          !Array.isArray(legacyCards)
            ? Object.fromEntries(
                Object.entries(legacyCards).map(([key, value]) => [
                  key,
                  ids(value),
                ]),
              )
            : {},
        notebooks: {},
        setNotebooks: (courseId, notebooks) =>
          set((state) => ({
            notebooks: { ...state.notebooks, [courseId]: notebooks },
          })),
        setCourses: (courses) => set({ courses }),
        setCards: (deckId, cards) =>
          set((state) => ({ cards: { ...state.cards, [deckId]: cards } })),
      }),
      {
        name: `folio:card-orders:${accountId}`,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          courses: state.courses,
          cards: state.cards,
          notebooks: state.notebooks,
        }),
      },
    ),
  );
}
const stores = new Map<string, ReturnType<typeof createCardOrderStore>>();
export function useCardOrderStore(accountId: string) {
  let store = stores.get(accountId);
  if (!store) {
    store = createCardOrderStore(accountId);
    stores.set(accountId, store);
  }
  return useStore(store);
}
