---
name: react-performance
description: Use when a React or Next.js app is slow, re-renders too much, has a large bundle, poor Lighthouse or Core Web Vitals (LCP, INP, CLS), slow lists, or when asked to optimize, profile or speed up a page or component.
---

# React / Next.js performance

**Measure first, change one thing, measure again.** Report before/after numbers. Do not add `useMemo`/`useCallback`/`memo` everywhere "just in case".

## 1. Measure

| Problem                        | Tool                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Slow page load / Web Vitals    | Lighthouse (mobile, incognito), PageSpeed Insights, `web-vitals` lib, Vercel Analytics |
| Slow interactions / re-renders | React DevTools Profiler ("Highlight updates", "Why did this render?")                  |
| Big JavaScript bundle          | `npx vite-bundle-visualizer` (Vite) or `@next/bundle-analyzer` (Next.js)               |
| Long tasks / jank              | Chrome DevTools → Performance tab, 4× CPU throttle                                     |
| Network waterfalls             | DevTools → Network, check request order and sizes                                      |

Targets: **LCP < 2.5 s, INP < 200 ms, CLS < 0.1**, initial JS < ~200 KB gzipped per route.

## 2. Fix — in order of impact

### Loading (LCP, bundle)

- **Split by route**: `React.lazy` + `<Suspense>` (Vite) or `next/dynamic` for heavy client-only widgets (charts, editors, maps).
- **Next.js**: keep components as Server Components; push `'use client'` to small leaf components. Client components ship JS; server components don't.
- **Images**: `next/image` (or `width`/`height` + `loading="lazy"` + WebP/AVIF). Add `priority` / `fetchpriority="high"` only to the LCP image.
- **Fonts**: `next/font` or self-host with `font-display: swap`; preload only the main font.
- **Dependencies**: replace heavy libs (moment → date-fns/dayjs, lodash → per-function imports or native). Check size on bundlephobia before adding a dependency.
- **Data**: fetch in parallel (`Promise.all`), not in a chain; in Next.js fetch on the server and stream with `loading.tsx` / `<Suspense>`.

### Rendering (INP, jank)

- **State placement**: keep state as low as possible; lifting it to the top re-renders the whole tree.
- **Context**: split large contexts (value + setter, or by domain); memoize the provider `value`. Frequently-changing global state → Redux Toolkit with small selectors instead of Context.
- **Selectors**: select the smallest value (`useAppSelector((s) => s.cart.items.length)`), not the whole slice; use `createSelector` for derived arrays/objects.
- **Lists**: stable `key` (ids, never index for reorderable lists); virtualize long lists (> ~100 rows) with `@tanstack/react-virtual` or `react-window`.
- **Memoization — only after profiling shows it helps**: `memo` for a component that re-renders often with the same props; `useMemo` for expensive calculations; `useCallback` for handlers passed to memoized children. If the project uses the React Compiler, skip manual memoization.
- **Typing/search**: debounce inputs; use `useDeferredValue` or `useTransition` for expensive filtering so typing stays responsive.
- **Effects**: don't derive state in `useEffect` (compute during render); avoid effect chains that cause extra renders.

### Layout stability (CLS)

- Reserve space for images, ads, embeds and skeletons (fixed width/height or `aspect-ratio`).
- Don't insert banners above existing content after load.

### Caching

- React Query: set sensible `staleTime` so the same data isn't refetched on every mount.
- Next.js: set caching explicitly on `fetch` (`{ next: { revalidate: 60 } }`) or route segment config; avoid making whole routes dynamic by accident (`cookies()`/`headers()` in a shared layout).

## 3. Report

```markdown
| Metric               | Before | After |
| -------------------- | ------ | ----- |
| LCP (mobile)         |        |       |
| INP / interaction ms |        |       |
| CLS                  |        |       |
| Route JS (gzipped)   |        |       |
| Renders on action X  |        |       |

Changes: …
```

See `references/checklist.md` for a quick review checklist.
