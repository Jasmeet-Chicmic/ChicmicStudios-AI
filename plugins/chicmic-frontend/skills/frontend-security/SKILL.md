---
name: frontend-security
description: Use when handling authentication, tokens, sessions, user-generated HTML, environment variables, third-party scripts, file uploads, redirects or security headers, or when reviewing a React or Next.js app for XSS, CSRF or secret leaks.
---

# Frontend security

## Secrets and env variables

- Anything with `NEXT_PUBLIC_` / `VITE_` is shipped to the browser — **public**. Never put API secrets, DB URLs or private keys there.
- Secrets stay on the server: Next.js Server Components, Server Actions, route handlers. Mark server modules with `import 'server-only'`.
- `.env*` files are git-ignored; only `.env.example` (no real values) is committed.

## Authentication

- Prefer httpOnly, `Secure`, `SameSite=Lax` cookies set by the server over tokens in `localStorage` (readable by any XSS).
- Use the project's auth library (NextAuth/Auth.js, Clerk, Auth0) — don't hand-roll session logic.
- Protect routes on the **server** (middleware, layout or page checks). Hiding a button in the UI is not authorization.
- Every Server Action and route handler checks the session and the user's permission for that resource.
- On logout clear the session server-side and the client caches: React Query `queryClient.clear()` and reset the Redux store.

## XSS

- React escapes text by default — keep it that way. Avoid `dangerouslySetInnerHTML`; if you must render HTML (CMS, rich text), sanitize with DOMPurify first.
- Never build `href`/`src` from user input without validating the protocol (block `javascript:`).
- Never `eval`, `new Function`, or inject user input into `<script>`.

## CSRF and requests

- Cookie-based auth: state-changing requests use POST/PUT/DELETE, never GET. Next.js Server Actions check the Origin; custom route handlers should too (or use CSRF tokens).
- Validate all input on the server with the same Zod schema as the client.

## Redirects and uploads

- Open-redirect: only redirect to relative paths or an allowlist (`?next=/dashboard`, not any URL).
- Uploads: validate type and size on the server, upload directly to storage with signed URLs, never trust the file extension.

## Headers and third parties

- Set security headers (`next.config.js` `headers()` or the host): `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors` / `X-Frame-Options`.
- Load third-party scripts with `next/script` and only from trusted domains in the CSP.
- Run `npm audit` and keep dependencies updated; don't add packages with few downloads or no maintenance without review.

## Review checklist

- [ ] No secrets in client code or `NEXT_PUBLIC_`/`VITE_` vars
- [ ] Auth checked server-side for every protected page, action and API
- [ ] No unsanitized `dangerouslySetInnerHTML`
- [ ] User-controlled URLs validated
- [ ] Inputs validated on the server
- [ ] Security headers present
