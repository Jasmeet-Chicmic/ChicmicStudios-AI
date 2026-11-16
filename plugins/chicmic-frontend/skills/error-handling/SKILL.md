---
name: error-handling
description: Use when adding error boundaries, loading/empty/error states, Suspense fallbacks, optimistic updates (useOptimistic, React Query onMutate), retry logic, toast notifications, or error logging (Sentry) in a React or Next.js project.
---

# Error handling, loading states and optimistic UI

## Every async UI has four states

Loading (skeleton matching the final layout, `role="status"`), **error** (friendly message + retry), **empty** (explain and offer the next action), **success**. Never leave a blank screen or an endless spinner.

## Error boundaries

- **Next.js App Router**: `error.tsx` per route segment (`'use client'`, receives `error` and `reset`), `global-error.tsx` for the root layout, `not-found.tsx` + `notFound()` for 404s.
- **Vite / plain React**: `react-error-boundary` around each independent area (page, sidebar, widget), not just one at the root, so one broken widget doesn't kill the page.

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  fallbackRender={({ resetErrorBoundary }) => (
    <div role="alert">
      <p>Something went wrong loading your orders.</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )}
  onError={(error) => logError(error)}
>
  <Suspense fallback={<OrdersSkeleton />}>
    <Orders />
  </Suspense>
</ErrorBoundary>;
```

Error boundaries do not catch errors in event handlers or async code — handle those with `try/catch` and show feedback (toast or inline).

## Optimistic updates

React 19 / Next.js Server Actions — `useOptimistic`:

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

export function LikeButton({ liked, onToggle }: { liked: boolean; onToggle: () => Promise<void> }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-pressed={optimisticLiked}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          setOptimisticLiked(!optimisticLiked);
          await onToggle(); // on error React reverts to `liked`; show a toast
        })
      }
    >
      {optimisticLiked ? 'Unlike' : 'Like'}
    </button>
  );
}
```

React Query: update the cache in `onMutate`, keep the previous value, roll back in `onError`, `invalidateQueries` in `onSettled`.

Use optimistic UI only for actions that almost always succeed (like, toggle, reorder). Never for payments or destructive actions.

## Forms with Server Actions

Use `useActionState` to get the action's returned `{ error }` and pending state; show field errors from the server next to the fields (see `forms-validation`).

## Messages and logging

- User-facing messages are human ("Couldn't save — check your connection and try again"), never raw error text or stack traces.
- Map API errors in one place (the HTTP client interceptor) to typed errors with a user message.
- Retry: network/5xx errors retry with backoff (React Query default 3); 4xx do not retry.
- Log unexpected errors to the project's monitoring tool (Sentry etc.) with context (route, user id — no passwords or tokens).
