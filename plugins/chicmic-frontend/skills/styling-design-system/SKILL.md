---
name: styling-design-system
description: Use when styling components, building responsive layouts, adding design tokens, theming or dark mode, creating shared UI-library components, animations, or writing Storybook stories in a React or Next.js project (Tailwind, CSS Modules, SCSS, styled-components, MUI, shadcn/ui).
---

# Styling and design system

Use the styling approach the project already uses (`AGENTS.md`, `package.json`). Never mix a second approach into an existing project.

## Rules

- **Tokens, not magic values**: colours, spacing, radius, font sizes, shadows and z-index come from tokens — CSS variables (`var(--color-primary)`), the Tailwind theme, or the UI-library theme. No raw hex codes or random `px` in components.
- **Mobile first**: base styles for small screens, then `min-width` breakpoints (`md:`, `lg:` in Tailwind). Check 360 px, 768 px, 1280 px.
- **Layout**: Flexbox for one direction, Grid for two; use `gap`, not margins between siblings. Use container queries for components that live in different-width slots.
- **Dark mode**: tokens switch on a `data-theme` attribute or `.dark` class on `<html>`; respect `prefers-color-scheme` by default; avoid a flash of the wrong theme (set the attribute before hydration — `next-themes` in Next.js).
- **Tailwind**: compose classes with `clsx` + `tailwind-merge` (`cn()` helper); variants with `cva`; extract a component instead of long repeated class strings; no `@apply` sprawl.
- **CSS Modules / SCSS**: one module per component, camelCase class names, shared variables/mixins in `styles/`.
- **Animations**: CSS transitions first; Framer Motion for complex/gesture animations; animate `transform`/`opacity` only; respect `prefers-reduced-motion`.
- **Shared components** (`components/ui/`): accessible (use the `accessibility` skill), support `className` passthrough and `ref` forwarding, typed variants (`variant="primary" | "secondary"`, `size`), documented with a story.
- Prefer a headless/tested base (Radix, shadcn/ui, Headless UI) for complex widgets — dialogs, menus, comboboxes — instead of building from scratch.

## Button with variants (Tailwind + cva)

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-6 text-lg' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

## Storybook story (if the project uses Storybook)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = { component: Button, args: { children: 'Save' } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
```

One story per meaningful state (variants, disabled, loading, long text, error). Add `@storybook/addon-a11y` to catch accessibility issues.

## Finish

Check the component at mobile, tablet and desktop widths, in light and dark mode, and with keyboard focus visible.
