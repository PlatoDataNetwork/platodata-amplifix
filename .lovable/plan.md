
# Highlight Active Menu Item in Management Sidebar

## Problem
The sidebar menu buttons already pass `isActive` correctly, and the shadcn sidebar component applies `data-[active=true]:bg-sidebar-accent` styling. However, the CSS variables `--sidebar-accent` and `--sidebar-accent-foreground` are not defined in the theme, so the active state has no visible effect.

## Solution
Add the missing sidebar CSS custom properties to `src/index.css` under the `:root` block. These will use values consistent with the existing dark theme.

## Technical Details

**File: `src/index.css`** -- Add sidebar CSS variables inside the existing `:root` block (after `--radius`):

```css
--sidebar-background: 220 20% 10%;
--sidebar-foreground: 210 40% 98%;
--sidebar-primary: 213 94% 58%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 213 94% 58% / 0.15;
--sidebar-accent-foreground: 213 94% 68%;
--sidebar-border: 220 15% 18%;
--sidebar-ring: 213 94% 58%;
```

This will make:
- Active items show a subtle blue-tinted background (`--sidebar-accent`)
- Active item text appears in a brighter blue (`--sidebar-accent-foreground`)
- The `font-medium` from the existing `data-[active=true]` rule will also kick in

No changes needed to `AdminSidebar.tsx` or `sidebar.tsx` -- the `isActive` prop is already wired up correctly.
