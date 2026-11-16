---
name: state-management
description: Use when deciding where state should live, adding global state, a store, slice, context or provider, syncing state with the URL, or fixing state bugs in a React or Next.js project (Redux Toolkit, Zustand, Context, React Query).
---

# State management

Use whatever store the project already uses (check `AGENTS.md` and `package.json`). Do not add a second state library.

## Decide where the state goes

| Kind of state                                                               | Put it in                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------- |
| Data from the server (lists, profile, products)                             | React Query / SWR / RTK Query — **not** a store |
| Shareable UI state (filters, tab, page, search)                             | URL search params                               |
| Form state                                                                  | React Hook Form (see `forms-validation`)        |
| Local UI state (open/closed, hover, input value)                            | `useState` / `useReducer` in the component      |
| Rarely-changing app-wide values (theme, locale, auth user)                  | Context                                         |
| Frequently-changing client state shared across pages (cart, editor, wizard) | Zustand or Redux Toolkit                        |

Start local, lift only when two siblings need it, go global only when distant parts of the app need it.

## Rules

- Never copy server data into a global store — it goes stale. Use the query cache.
- Never store derived values; compute them (or use a selector).
- Select the smallest slice to avoid re-renders: `useCartStore((s) => s.items.length)`.
- Keep actions/reducers pure; side effects (API calls) live in services/thunks/query mutations.
- Context: one context per concern; memoize the `value`; split value and dispatch if consumers only need one.
- Persisted state (`localStorage`): version it and handle missing/old shapes; never persist tokens unless AGENTS.md says so.
- Next.js: stores are client-only. Create the store per request/provider (not a module singleton shared between users on the server), and wrap with a client `Providers` component in the root layout.

## Zustand template

```ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  qty: number;
}
interface CartState {
  items: CartItem[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  add: (id) =>
    set((s) => {
      const existing = s.items.find((i) => i.id === id);
      return existing
        ? { items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) }
        : { items: [...s.items, { id, qty: 1 }] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));
```

## Redux Toolkit

Use `createSlice`, typed `useAppSelector`/`useAppDispatch` hooks, and RTK Query for server data. No hand-written action types or `switch` reducers.

## Finish

Add unit tests for store logic (actions in, state out) and check with React DevTools that unrelated components don't re-render on updates.
