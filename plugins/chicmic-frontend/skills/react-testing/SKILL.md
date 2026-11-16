---
name: react-testing
description: Use when writing, fixing or adding unit/component tests for React or Next.js code (components, hooks, services, utils) with Vitest or Jest and React Testing Library.
---

# React testing

Default stack: **Vitest + React Testing Library + @testing-library/user-event + MSW**. If the project uses Jest, the same patterns apply (`jest.fn()` instead of `vi.fn()`). If the project has no test setup yet, use the `frontend-tooling-setup` skill first.

## What to test

| Code               | Test                                                         |
| ------------------ | ------------------------------------------------------------ |
| Utils / pure logic | Inputs → outputs, edge cases (empty, null, boundaries)       |
| Components         | What the user sees and does: render, click, type, states     |
| Hooks              | `renderHook` with the providers they need                    |
| Services           | Request is correct and response is mapped; errors are thrown |

## Rules

- Test behaviour, not implementation: query by role/label/text (`getByRole('button', { name: /save/i })`), never by class name or test-internal state.
- Use `userEvent` (not `fireEvent`) for interactions; `await` every interaction.
- Cover loading, success, empty and error states for anything async.
- Mock the network with MSW handlers, not by mocking axios internals.
- One behaviour per `it`; descriptive names: `it('shows an error when the save fails')`.
- Tests live next to the file: `UserCard.test.tsx`.
- No snapshot tests for whole components.

## Template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits email and password', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' });
  });

  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });
});
```

## Finish

Run `npm test` (and `npm run test:coverage` if available). All tests must pass; do not skip or delete failing tests to make the suite green — fix the cause or report it.
