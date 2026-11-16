# Performance review checklist

Use during code review or before a release.

## Bundle and loading

- [ ] Heavy, below-the-fold or modal-only components are lazy loaded
- [ ] No new dependency over ~30 KB gzipped without a reason in the PR
- [ ] No full-library imports (`import _ from 'lodash'`, whole icon packs)
- [ ] LCP image has priority; other images lazy load with explicit size
- [ ] Fonts use `next/font` or `font-display: swap`
- [ ] Next.js: `'use client'` only on leaf components that need it

## Rendering

- [ ] No state lifted higher than needed
- [ ] Context values memoized; large contexts split
- [ ] Store selectors pick minimal slices
- [ ] Lists use stable keys; long lists virtualized
- [ ] No derived state stored in `useState` + `useEffect`
- [ ] Expensive filtering/sorting memoized or deferred
- [ ] Inputs that trigger work are debounced

## Data

- [ ] Independent requests run in parallel
- [ ] Cached with sensible `staleTime` / `revalidate`
- [ ] Pagination or infinite scroll for large data sets
- [ ] Requests aborted on unmount / when params change

## Layout

- [ ] Images, embeds and skeletons reserve space (no CLS)
- [ ] No layout-thrashing reads/writes in loops
