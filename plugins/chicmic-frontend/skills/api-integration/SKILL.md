---
name: api-integration
description: Use when integrating a REST API endpoint, fetching or mutating data, adding a service function, a React Query (TanStack Query) useQuery or useMutation hook, or handling auth tokens and API errors in a Chicmic React or Next.js project.
---

# API integration

**JavaScript.. side effect. New projects are always TypeScript.

**Chicmic standard:** all API / server data goes through **TanStack React Query** (`@tanstack/react-query` v5). Client-only global state goes in Redux Toolkit (see `state-management`) — never put API responses in Redux, and do not use RTK Query or SWR. Existing projects that already use another data library keep it (check `AGENTS.md`).

## Layers

```text
src/
├── api/client.ts          # one configured axios/fetch instance: baseURL, auth header, interceptors
├── services/user.service.ts  # plain async functions, one per endpoint, typed request/response
├── hooks/useUsers.ts      # React Query hooks wrapping the service (useQuery / useMutation)
├── lib/queryClient.ts     # the shared QueryClient and its defaults
└── types/user.ts          # API types
```

Components only use hooks. Hooks only use services. Services only use the client.

## Steps

1. Add/extend the types in `src/types/` from the API docs or Postman collection. Do not use `any`.
2. Add a service function:

   ```ts
   export async function getUsers(
     params: GetUsersParams,
     { signal }: { signal?: AbortSignal } = {},
   ): Promise<User[]> {
     const { data } = await apiClient.get<ApiResponse<User[]>>('/users', { params, signal });
     return data.data;
   }
   ```

   Pass `signal` through so React Query can cancel stale requests.

3. Wrap it in React Query hooks. Query keys start with the resource name, then the params:

   ```ts
   export const userKeys = {
     all: ['users'] as const,
     list: (params: GetUsersParams) => ['users', 'list', params] as const,
     detail: (id: string) => ['users', 'detail', id] as const,
   };

   export function useUsers(params: GetUsersParams) {
     return useQuery({
       queryKey: userKeys.list(params),
       queryFn: ({ signal }) => getUsers(params, { signal }),
     });
   }

   export function useCreateUser() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: createUser,
       onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
     });
   }
   ```

   Components read `data`, `isPending`, `error` and handle loading / error / empty states.

4. **QueryClient setup** (once per app, in `src/lib/queryClient.ts`, provided in `main.tsx` or the Next.js `Providers`):

   ```ts
   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: { staleTime: 60_000, retry: (count, err) => !isClientError(err) && count < 3 },
     },
   });
   ```

   Add `@tanstack/react-query-devtools` in development. In Next.js create the client inside a client `Providers` component with `useState(() => new QueryClient(...))`, not as a server-shared module.

5. Handle errors in one place: the client interceptor maps HTTP errors to a typed `ApiError` and handles 401 (refresh token or logout). UI shows a user-friendly message, never a raw stack trace.
6. Base URLs and keys come from env (`import.meta.env.VITE_API_URL` / `process.env.NEXT_PUBLIC_API_URL`). Add new variables to `.env.example`.
7. Test the service and hooks with mocked HTTP (MSW) — wrap hook tests in a fresh `QueryClientProvider` with `retry: false` — see the `react-testing` skill.

**Next.js:** Server Components call the service directly (no hook) and pass data down as props; use React Query hooks in client components for interactive data (pagination, search, mutations).

## Real-time data (WebSockets / SSE / Socket.IO)

- One connection per app, created in a provider or a module (`src/realtime/socket.ts`), not per component.
- Components subscribe through a hook (`useSocketEvent('order:updated', handler)`) that unsubscribes on unmount.
- Incoming events update the React Query cache (`queryClient.setQueryData`) instead of a separate copy of the data.
- Handle reconnects: show connection status, refetch/invalidate queries after reconnect so no updates are missed.
- Use Server-Sent Events for one-way server → client streams (notifications, progress); WebSockets when the client also sends.

## Do not

- Do not call `fetch`/`axios` inside components or `useEffect` — use a React Query hook.
- Do not copy query data into Redux or `useState`; read it from the hook.
- Do not store tokens in `localStorage` if the project uses httpOnly cookies — follow AGENTS.md.
- Do not hard-code URLs, IDs or tokens.
