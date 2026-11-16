---
name: api-integration
description: Use when integrating a REST API endpoint, adding a service function, data-fetching hook, or handling auth tokens and API errors in a Chicmic React or Next.js project.
---

# API integration

Follow the layering below. If the project's `AGENTS.md` names a different HTTP client or data library, use that.

## Layers

```text
src/
├── api/client.ts          # one configured axios/fetch instance: baseURL, auth header, interceptors
├── services/user.service.ts  # plain async functions, one per endpoint, typed request/response
├── hooks/useUsers.ts      # React Query / SWR / custom hook wrapping the service
└── types/user.ts          # API types
```

Components only use hooks. Hooks only use services. Services only use the client.

## Steps

1. Add/extend the types in `src/types/` from the API docs or Postman collection. Do not use `any`.
2. Add a service function:

   ```ts
   export async function getUsers(params: GetUsersParams): Promise<User[]> {
     const { data } = await apiClient.get<ApiResponse<User[]>>('/users', { params });
     return data.data;
   }
   ```

3. Wrap it in a hook (React Query example):

   ```ts
   export function useUsers(params: GetUsersParams) {
     return useQuery({ queryKey: ['users', params], queryFn: () => getUsers(params) });
   }
   ```

   Mutations invalidate the related query keys on success.

4. Handle errors in one place: the client interceptor maps HTTP errors to a typed `ApiError` and handles 401 (refresh token or logout). UI shows a user-friendly message, never a raw stack trace.
5. Base URLs and keys come from env (`import.meta.env.VITE_API_URL` / `process.env.NEXT_PUBLIC_API_URL`). Add new variables to `.env.example`.
6. Test the service with mocked HTTP (MSW preferred) — see the `react-testing` skill.

## Real-time data (WebSockets / SSE / Socket.IO)

- One connection per app, created in a provider or a module (`src/realtime/socket.ts`), not per component.
- Components subscribe through a hook (`useSocketEvent('order:updated', handler)`) that unsubscribes on unmount.
- Incoming events update the React Query cache (`queryClient.setQueryData`) instead of a separate copy of the data.
- Handle reconnects: show connection status, refetch/invalidate queries after reconnect so no updates are missed.
- Use Server-Sent Events for one-way server → client streams (notifications, progress); WebSockets when the client also sends.

## Do not

- Do not call `fetch`/`axios` inside components.
- Do not store tokens in `localStorage` if the project uses httpOnly cookies — follow AGENTS.md.
- Do not hard-code URLs, IDs or tokens.
