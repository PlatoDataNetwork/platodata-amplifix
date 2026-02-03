

# Implementation Plan: Replicating the Management Dashboard

This plan provides a step-by-step guide to replicate the complete admin management dashboard in your other Lovable application.

---

## Overview

The management dashboard is a full-featured admin panel with:
- Role-based authentication (admin/moderator/user roles)
- Dashboard with quick stats
- Article management with rich text editor
- Tags and verticals/categories management
- RSS Feed Syndicator with auto-sync capabilities
- Default featured images pool
- Site settings management
- Collapsible sidebar navigation

---

## Phase 1: Database Schema Setup

### 1.1 Create User Roles System

Run this SQL migration first to set up secure role-based access control:

```text
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 1.2 Create Core Content Tables

```text
-- Articles table
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id BIGINT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    author TEXT,
    read_time TEXT,
    category TEXT,
    vertical_slug TEXT NOT NULL,
    image_url TEXT,
    external_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Article-Tags junction table
CREATE TABLE public.article_tags (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Site settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
```

### 1.3 Create RSS Feed Syndicator Tables

```text
-- Feed status and mode enums
CREATE TYPE public.feed_status AS ENUM ('active', 'paused', 'error');
CREATE TYPE public.feed_import_mode AS ENUM ('full_content', 'excerpt_with_link');
CREATE TYPE public.feed_publish_status AS ENUM ('publish', 'draft');

-- RSS Feeds table
CREATE TABLE public.rss_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    feed_url TEXT NOT NULL,
    vertical_slug TEXT NOT NULL,
    status feed_status NOT NULL DEFAULT 'active',
    import_mode feed_import_mode NOT NULL DEFAULT 'full_content',
    publish_status feed_publish_status NOT NULL DEFAULT 'draft',
    auto_sync BOOLEAN NOT NULL DEFAULT false,
    sync_interval_hours INTEGER NOT NULL DEFAULT 24,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    default_image_url TEXT,
    check_duplicate_title BOOLEAN NOT NULL DEFAULT false,
    check_duplicate_link BOOLEAN NOT NULL DEFAULT false,
    max_articles_per_sync INTEGER NOT NULL DEFAULT 0,
    strip_images BOOLEAN NOT NULL DEFAULT true,
    strip_inline_styles BOOLEAN NOT NULL DEFAULT true,
    default_author TEXT,
    source_link_text TEXT,
    source_link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

-- Feed sync logs table
CREATE TABLE public.feed_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE NOT NULL,
    article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    original_guid TEXT NOT NULL,
    original_url TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.feed_sync_logs ENABLE ROW LEVEL SECURITY;

-- Default featured images pool
CREATE TABLE public.default_featured_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.default_featured_images ENABLE ROW LEVEL SECURITY;
```

### 1.4 Create RLS Policies

```text
-- Articles policies
CREATE POLICY "Articles are publicly readable" ON public.articles
FOR SELECT USING (true);

CREATE POLICY "Admins can insert articles" ON public.articles
FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles" ON public.articles
FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles" ON public.articles
FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Similar patterns for tags, article_tags, site_settings, rss_feeds, 
-- feed_sync_logs, default_featured_images (public read for public content,
-- admin-only write operations)
```

### 1.5 Create Helper Function

```text
-- Function to get unique verticals from articles
CREATE OR REPLACE FUNCTION public.get_article_verticals()
RETURNS TABLE(vertical_slug TEXT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT DISTINCT a.vertical_slug
  FROM public.articles a
  WHERE a.vertical_slug IS NOT NULL AND a.vertical_slug <> ''
  ORDER BY a.vertical_slug;
$$;
```

### 1.6 Create Storage Bucket

```text
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Storage policies for admin uploads
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'article-images' AND
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'article-images' AND
    public.has_role(auth.uid(), 'admin')
);
```

---

## Phase 2: Authentication Setup

### 2.1 Create Auth Hook

Create `src/hooks/useAuth.tsx`:

**Key features:**
- AuthProvider wrapper component
- Manages user session state
- Calls `has_role` RPC to check admin status
- Provides `signIn` and `signOut` functions
- Defers admin check to avoid deadlocks

**Pattern to follow:** Uses `supabase.auth.onAuthStateChange` listener set up BEFORE `getSession()` call.

### 2.2 Create Login Page

Create `src/pages/Login.tsx`:

**Key features:**
- Simple email/password form
- Zod validation for inputs
- Redirects to `/management` on successful admin login
- Error handling for invalid credentials
- Loading states

---

## Phase 3: Dashboard Layout Components

### 3.1 Create Admin Sidebar

Create `src/components/admin/AdminSidebar.tsx`:

**Key features:**
- Collapsible sidebar using shadcn/ui Sidebar components
- Nested menu structure with Collapsible components
- View-based navigation (not URL-based)
- Active state highlighting
- Icon support with lucide-react

**Menu Structure:**
- Dashboard
- Articles (sub-menu: All Articles, New Article, Tags, Verticals)
- Feed Syndicator (sub-menu: All Feeds, Add Feed, Logs)
- Default Images
- Settings (sub-menu: General, Analytics, Sitemaps, Robots.txt)

### 3.2 Create Main Management Page

Create `src/pages/Management.tsx`:

**Key features:**
- Fixed header with user email and sign-out button
- SidebarProvider wrapper
- View state management (not URL routing)
- Quick stats cards on dashboard (Total Articles, Verticals, RSS Feeds)
- Conditional rendering based on currentView state
- Admin-only access check with redirect

---

## Phase 4: Article Management Components

### 4.1 Article Management List

Create `src/components/admin/ArticleManagement.tsx`:

**Key features:**
- Paginated article table with search
- Vertical filter dropdown
- Feed-based filtering
- Inline edit/delete buttons
- Skeleton loading states
- Delete confirmation dialog

### 4.2 Article Editor

Create `src/components/admin/ArticleEditor.tsx`:

**Key features:**
- Two-column layout (content left, metadata right)
- Title, excerpt, content fields
- Vertical dropdown selection
- Tag multi-select with add/remove
- Featured image upload
- Auto-generated sequential post_id
- Create and update mutations

### 4.3 Rich Text Editor

Create `src/components/admin/RichTextEditor.tsx`:

**Key features:**
- Tiptap editor integration
- Toolbar with formatting buttons (bold, italic, headings, lists, quotes)
- Link insertion popover
- Image insertion (upload to Supabase Storage or URL)
- Undo/redo support

### 4.4 Image Upload Component

Create `src/components/admin/ImageUpload.tsx`:

**Key features:**
- Tab interface (Upload/URL)
- Drag-and-drop file selection
- Upload to Supabase Storage
- Image preview with remove button
- File validation (type, size)

---

## Phase 5: Tags & Categories Management

### 5.1 Tags Management

Create `src/components/admin/TagsManagement.tsx`:

**Key features:**
- CRUD operations for tags
- Search functionality
- Create/Edit dialogs
- Delete confirmation
- Auto-slug generation from name

### 5.2 Verticals Management

Create `src/components/admin/VerticalsManagement.tsx`:

**Key features:**
- Display verticals from articles
- Article count per vertical
- Click-through to filtered articles view

---

## Phase 6: RSS Feed Syndicator

### 6.1 Feeds Management UI

Create `src/components/admin/FeedsSyndicator.tsx` (~1350 lines):

**Key features:**
- List view with feed status, article count, last sync time
- Add/Edit feed forms with extensive configuration:
  - Feed name and URL
  - Vertical assignment
  - Import mode (full content / excerpt with link)
  - Publish status
  - Auto-sync toggle and interval
  - Default image URL
  - Duplicate checking options
  - Max articles per sync
  - Strip images/inline styles options
  - Default author
  - Source link attribution
- Manual sync button per feed
- Bulk sync all active feeds
- Delete feed and associated articles
- View articles by feed navigation

### 6.2 Feed Sync Logs

Create `src/components/admin/FeedSyncLogs.tsx`:

**Key features:**
- Paginated log history
- Filter by feed and date range
- Display post_id, status (Imported/Skipped), source URL

### 6.3 Sync RSS Feed Edge Function

Create `supabase/functions/sync-rss-feed/index.ts`:

**Key features:**
- Fetch and parse RSS/Atom feeds
- Extract title, content, link, author, images
- Strip images and inline styles from content
- Check duplicates by title or link
- Sequential post_id assignment
- Default image fallback (feed default > random from pool)
- Source link attribution
- Sync logging

### 6.4 Auto-Sync Edge Function

Create `supabase/functions/auto-sync-feeds/index.ts`:

**Key features:**
- Called by pg_cron job hourly
- Iterates feeds where auto_sync=true
- Checks if sync_interval_hours has elapsed
- Invokes sync-rss-feed for each eligible feed

---

## Phase 7: Default Featured Images

Create `src/components/admin/DefaultFeaturedImages.tsx`:

**Key features:**
- Multi-file drag-and-drop upload
- Grid gallery view
- Image preview modal
- Delete confirmation
- Random selection in sync function

---

## Phase 8: Settings Management

### 8.1 General Settings

Create `src/components/admin/settings/GeneralSettings.tsx`:

**Key features:**
- Site name and description inputs
- Load from site_settings table
- Save mutation

### 8.2 Additional Settings (Optional)

- AnalyticsSettings.tsx - Google Analytics configuration
- RobotsSettings.tsx - robots.txt content
- SitemapsSettings.tsx - Sitemap configuration

---

## Phase 9: Routing Setup

Add routes to your App.tsx:

```text
<Route path="/login" element={<Login />} />
<Route path="/management" element={<Management />} />
```

---

## Technical Details

### Dependencies Required

```text
@tanstack/react-query - Data fetching
@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-image - Rich text editor
sonner - Toast notifications
lucide-react - Icons
date-fns - Date formatting
zod - Form validation
```

### Key Patterns Used

1. **View-based navigation** - Management page uses state (`currentView`) instead of URL routes for sub-views
2. **React Query** - All data fetching uses useQuery/useMutation with proper cache invalidation
3. **Optimistic updates** - Toast feedback after mutations
4. **Sequential ID generation** - Queries max post_id and increments for new articles
5. **Security definer functions** - Prevents RLS recursion when checking roles

### File Count Estimate

- Hooks: 2 files
- Pages: 2 files
- Admin components: 12-15 files
- Edge functions: 2-3 files
- Migrations: 5-8 SQL files

---

## Implementation Order

1. Run all database migrations (Phase 1)
2. Create storage bucket
3. Create useAuth hook and Login page (Phase 2)
4. Create AdminSidebar and Management page (Phase 3)
5. Create ArticleManagement, ArticleEditor, RichTextEditor, ImageUpload (Phase 4)
6. Create TagsManagement, VerticalsManagement (Phase 5)
7. Create FeedsSyndicator, FeedSyncLogs, sync-rss-feed edge function (Phase 6)
8. Create DefaultFeaturedImages (Phase 7)
9. Create GeneralSettings and other settings (Phase 8)
10. Add routes (Phase 9)
11. Create first admin user manually in Supabase dashboard

---

## Creating Your First Admin User

After setup, run this in Supabase SQL Editor:

```text
-- Replace 'your-user-uuid' with the actual user ID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-uuid', 'admin');
```

