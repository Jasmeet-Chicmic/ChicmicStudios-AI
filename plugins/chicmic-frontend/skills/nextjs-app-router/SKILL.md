---
name: nextjs-app-router
description: Use when adding or changing routes, layouts, pages, Server Components, Server Actions, route handlers, middleware, data fetching, caching, metadata/SEO or loading and error states in a Next.js App Router project.
---

# Next.js App Router

**JavaScript projects:** the examples are TypeScript. In an existing `.js`/`.jsx` project, write the same code without types and document props and data shapes with JSDoc (`@typedef`, `@param`). Do not convert files to TypeScript as a side effect. New projects are always TypeScript.

Check the Next.js version in `package.json` first — caching defaults changed between 14 and 15 (in 15, `fetch` is not cached by default and `params`/`searchParams` are Promises). If the project uses the `pages/` router, tell the user and follow `pages/` conventions instead.

## Route files

```text
app/(shop)/products/[id]/
├── page.tsx       # the route UI (Server Component by default)
├── layout.tsx     # shared UI that persists across child routes
├── loading.tsx    # streaming fallback while page data loads
├── error.tsx      # 'use client' error boundary with reset()
└── not-found.tsx  # rendered by notFound()
app/api/…/route.ts # route handlers (GET/POST…) — only for webhooks/external clients
```

Route groups `(name)` organise without changing the URL. Private folders `_components` stay out of routing.

## Server vs Client Components

- **Default to Server Components.** Fetch data, read secrets, access the DB/API directly there.
- Add `'use client'` only for state, effects, event handlers, browser APIs, or client-only libraries. Keep those components small and pass server data down as props.
- Never import server-only code (secrets, DB) into a client component — use the `server-only` package in those modules.
- Props from server to client must be serializable (no functions, class instances, Dates → pass ISO strings).

## Data fetching and caching

```tsx
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getProduct } from '@/services/product.service';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id); // fetch(..., { next: { revalidate: 60, tags: ['product', id] } })
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
```

- Run independent fetches in parallel with `Promise.all`.
- Be explicit about caching: `{ cache: 'force-cache' }`, `{ next: { revalidate: N } }`, or `{ cache: 'no-store' }` for per-user data.
- After a mutation, call `revalidatePath()` or `revalidateTag()`.
- Wrap slow parts in `<Suspense>` so the rest of the page streams immediately.

## Mutations — Server Actions

```tsx
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({ title: z.string().min(1) });

export async function createTodo(_prev: unknown, formData: FormData) {
  const parsed = schema.safeParse({ title: formData.get('title') });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  // check auth here — Server Actions are public endpoints
  await db.todo.create({ data: parsed.data });
  revalidatePath('/todos');
  return { ok: true };
}
```

Always validate input and check authorization inside every Server Action.

## Metadata / SEO

- Static: `export const metadata = { title, description, openGraph }`.
- Dynamic: `export async function generateMetadata({ params })`.
- Add `app/sitemap.ts` and `app/robots.ts` for public sites.

## Do not

- Do not use `useEffect` + `fetch` for data a Server Component could load.
- Do not put `cookies()`/`headers()` in a shared layout unless every child route really must be dynamic.
- Do not expose secrets with `NEXT_PUBLIC_`.
- Do not create API routes just to call them from your own Server Components — call the service directly.

## Finish

Run `npm run build` — it reports static vs dynamic routes and type errors. Check that routes you expected to be static still are.
