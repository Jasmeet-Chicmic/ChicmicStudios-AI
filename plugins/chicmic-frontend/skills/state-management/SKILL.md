---
name: state-management
description: Use when deciding where state should live, adding global state, a Redux store, slice, selector, context or provider, syncing state with the URL, or fixing state bugs in a React or Next.js project. Chicmic standard is Redux Toolkit for client state and React Query for server data.
---

# State management

**JavaScript projects:** the examples are TypeScript. In an existing `.js`/`.jsx` project, write the same code without types and document props and data shapes with JSDoc (`@typedef`, `@param`). Do not convert files to TypeScript as a side effect. New projects are always TypeScript.

**Chicmic standard:** **Redux Toolkit** for global client state, **TanStack React Query** for anything that comes from an API (see `api-integration`). Existing projects that use another library (Zustand, MobX, plain Context) keep it — check `AGENTS.md` and `package.json`, and never add a second state library.

## Decide where the state goes

| Kind of state                                                      | Put it in                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Data from the server (lists, profile, products)                    | **React Query** — never Redux                                      |
| Shareable UI state (filters, tab, page, search)                    | URL search params                                                  |
| Form state                                                         | React Hook Form (see `forms-validation`)                           |
| Local UI state (open/closed, hover, input value)                   | `useState` / `useReducer` in the component                         |
| Rarely-changing app-wide values (theme, locale)                    | Context, or a small Redux slice if the project already has a store |
| Client state shared across pages (cart, wizard, editor, auth user) | **Redux Toolkit** slice                                            |

Start local, lift only when two siblings need it, go global (Redux) only when distant parts of the app need it.

## Rules

- **Never copy API responses into Redux** — they go stale and duplicate the React Query cache. Store only ids or client-only choices (selected id, cart quantities).
- Do not use RTK Query; React Query is the team's one data-fetching library.
- Always `createSlice` + `configureStore`. No hand-written action types, `switch` reducers, `connect()` or `redux-thunk` setup.
- Use the typed hooks `useAppDispatch` / `useAppSelector` everywhere — never plain `useDispatch` / `useSelector`.
- Select the smallest value: `useAppSelector((s) => s.cart.items.length)`. Selectors that build new arrays/objects go through `createSelector`.
- Never store derived values; compute them in a selector.
- Reducers stay pure. API calls live in services + React Query mutations, not in reducers. Use `createAsyncThunk` only for client-only async work that is not server data.
- Persisted state (`redux-persist` / `localStorage`): whitelist the slices, version it, never persist tokens unless AGENTS.md says so.
- On logout dispatch a reset (`logout` action handled in every slice, or `resetStore`) **and** call `queryClient.clear()`.

## Files

```text
src/store/
├── index.ts              # makeStore, RootState, AppDispatch
├── hooks.ts              # useAppDispatch, useAppSelector
└── slices/cartSlice.ts   # one slice per domain, with its selectors
```

## Templates

```ts
// src/store/slices/cartSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface CartItem {
  id: string;
  qty: number;
}
interface CartState {
  items: CartItem[];
}
const initialState: CartState = { items: [] };

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    added(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item)
        item.qty += 1; // Immer: mutating syntax is safe here
      else state.items.push({ id: action.payload, qty: 1 });
    },
    removed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    cleared: () => initialState,
  },
});

export const { added, removed, cleared } = cartSlice.actions;
export const selectCartCount = (s: RootState) => s.cart.items.reduce((n, i) => n + i.qty, 0);
```

```ts
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { cartSlice } from './slices/cartSlice';

export const makeStore = () => configureStore({ reducer: { cart: cartSlice.reducer } });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
```

```ts
// src/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## Providers

**Vite / React** — create the store once in `main.tsx`, Redux outside React Query:

```tsx
const store = makeStore();
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>,
);
```

**Next.js App Router** — the store must be created **per request**, never as a module singleton (it would be shared between users on the server). Use a client `StoreProvider` in the root layout:

```tsx
'use client';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
```

Only client components can use `useAppSelector`; Server Components get data from services, not from the store.

## Finish

Unit-test each slice (state + action in → state out) and its selectors. Check with React DevTools / Redux DevTools that unrelated components don't re-render on updates.
