

# Full Redesign of the Management Dashboard

## Overview
Replace the current basic dashboard (3 cards + 3 stat counters) with a modern, data-rich dashboard featuring stat cards with icons and trends, a recent articles feed, feed sync status, top verticals breakdown, and quick action buttons.

## New Dashboard Layout

```text
+--------------------------------------------------+
|  Welcome, Admin                                   |
|  Manage your platform from this dashboard.        |
+--------------------------------------------------+
|                                                    |
|  [Articles]  [Verticals]  [RSS Feeds]  [Tags]    |
|   611,357      20+          45          327,909   |
|   4 stat cards with icons, formatted numbers      |
|                                                    |
+-------------------------+-------------------------+
|  Quick Actions          |  Feed Sync Status       |
|  [New Article]          |  Feed 1 - synced 2m ago |
|  [Add Feed]             |  Feed 2 - synced 5m ago |
|  [View Analytics]       |  Feed 3 - synced 8m ago |
|  [General Settings]     |                         |
+-------------------------+-------------------------+
|  Recent Articles                                  |
|  Title | Vertical | Author | Published            |
|  ...5 most recent articles...                     |
+-------------------------+-------------------------+
|  Top Verticals          |                         |
|  blockchain  112,067    |                         |
|  platohealth  66,550    |                         |
|  gaming       49,526    |                         |
|  ...progress bars...    |                         |
+-------------------------+-------------------------+
```

## Technical Details

### File: `src/pages/Management.tsx` (lines 126-216)

Replace the `case "dashboard"` content with:

**1. Stat Cards Row (4 cards)**
- Total Articles (FileText icon) -- formatted with `toLocaleString()`
- Verticals (Layers icon) -- count from `get_article_verticals` RPC
- RSS Feeds (Rss icon) -- count from `rss_feeds` table
- Tags (Tags icon) -- new query, count from `tags` table
- Each card is clickable, navigating to the relevant section
- Styled with gradient icon backgrounds and large bold numbers

**2. Quick Actions + Feed Sync Status (2-column grid)**
- Left: 4 quick action buttons (New Article, Add Feed, View Analytics, General Settings) with icons
- Right: Card showing last 5 feed syncs with relative timestamps using `date-fns`'s `formatDistanceToNow`

**3. Recent Articles (full-width card)**
- Table showing last 5 articles: title, vertical badge, author, published time (relative)
- Each row clickable to navigate to articles view

**4. Top Verticals (full-width card)**
- List of top 6 verticals with article counts and progress bars showing relative proportion
- Each row clickable to navigate to articles filtered by that vertical

### New Queries Added
- **Tags count**: `supabase.from("tags").select("*", { count: "exact", head: true })`
- **Recent articles**: `supabase.from("articles").select("title, vertical_slug, author, published_at").order("published_at", { ascending: false }).limit(5)`
- **Recent feed syncs**: `supabase.from("rss_feeds").select("id, name, status, last_synced_at, last_error").order("last_synced_at", { ascending: false }).limit(5)`
- **Top verticals**: `supabase.rpc("get_article_verticals")` (already exists, just display more data)

### New Imports
- `Tags, Layers, Rss, Plus, ArrowRight, Clock, TrendingUp` from `lucide-react`
- `formatDistanceToNow` from `date-fns`
- `Badge` from `@/components/ui/badge`
- `Progress` from `@/components/ui/progress`

### Styling
- Uses existing design tokens (bg-card, border-border, text-primary, etc.)
- Stat cards have subtle gradient icon containers
- Hover effects on all interactive elements
- Responsive: 4-col stats on desktop, 2-col on tablet, 1-col on mobile
- Cards use the existing Card component from shadcn

