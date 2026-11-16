---
name: forms-validation
description: Use when building or fixing a form (login, signup, checkout, settings, multi-step wizard), adding input validation, error messages, or form submission in a React or Next.js project.
---

# Forms and validation

**JavaScript projects:** the examples are TypeScript. In an existing `.js`/`.jsx` project, write the same code without types and document props and data shapes with JSDoc (`@typedef`, `@param`). Do not convert files to TypeScript as a side effect. New projects are always TypeScript.

Default stack: **React Hook Form + Zod** (`@hookform/resolvers/zod`). Use the project's existing form library if it has one.

## Rules

- One Zod schema per form, in `schemas/` or next to the form; infer the TS type from it (`z.infer<typeof schema>`). Reuse the same schema on the server (API / Server Action).
- Every input has a visible `<label>` (or `aria-label`), correct `type` (`email`, `tel`, `number`) and `autoComplete`.
- Show errors next to the field, linked with `aria-describedby`, and set `aria-invalid`.
- Validate on submit, then on change for fields that already have an error (`mode: 'onTouched'` is a good default).
- Disable the submit button while submitting and show progress; prevent double submit.
- Show server errors (for example "email already registered") on the right field with `setError`, and general errors in a form-level `role="alert"`.
- Never trust client validation alone — the server validates again.
- Multi-step forms: one schema per step, keep values in one form instance, validate the step with `trigger()` before moving on.

## Template

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm({ onSubmit }: { onSubmit: (v: SignupValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: 'onTouched' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
        {...register('email')}
      />
      {errors.email && <p id="email-error">{errors.email.message}</p>}

      {/* password and confirm follow the same pattern */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Sign up'}
      </button>
    </form>
  );
}
```

## Finish

Test with the `react-testing` skill: valid submit, each validation error, server error, and that submit is disabled while pending.
