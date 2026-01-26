
# Plan: Optimize Add New RSS Feed Form Layout

## Overview
Reorganize the RSS feed form into logical, collapsible sections with improved visual hierarchy and balanced grid layouts.

## Current Issues
- All fields crammed into a single large card (overwhelming)
- "Max Articles Per Sync" sits alone creating asymmetric layout
- Related settings are scattered (e.g., sync settings not grouped together)
- Form is very long without clear visual separation
- Lacks clear grouping of related functionality

## Proposed Layout Structure

The form will be reorganized into **4 distinct cards** with logical groupings:

```text
┌─────────────────────────────────────────────────────────────────┐
│  CARD 1: Basic Information                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Feed Name *         │  │ RSS Feed URL *      │               │
│  └─────────────────────┘  └─────────────────────┘               │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Target Vertical *   │  │ Default Author      │               │
│  └─────────────────────┘  └─────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CARD 2: Import Settings                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ Import Mode     │ │ Article Status  │ │ Max Per Sync    │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│  ┌───────────────────────────────────────┐                      │
│  │ Duplicate Checking  [Title] [Link]   │                      │
│  └───────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CARD 3: Sync Schedule                                          │
│  ┌──────────────────────────────┐ ┌────────────────────────┐    │
│  │ Enable Auto-sync    [toggle] │ │ Sync Interval (hours)  │    │
│  └──────────────────────────────┘ └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CARD 4: Content & Media                                        │
│  ┌───────────────────────────────────────┐                      │
│  │ Content Processing [Strip Images] [Strip Styles]            │
│  └───────────────────────────────────────┘                      │
│  ┌───────────────────────────────────────┐                      │
│  │ Source Attribution  [toggle + config]                        │
│  └───────────────────────────────────────┘                      │
│  ┌───────────────────────────────────────┐                      │
│  │ Default Featured Image [preview + upload]                    │
│  └───────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### File to Modify
- `src/components/admin/FeedsSyndicator.tsx`

### Changes

**1. Split the single Card into 4 logical Cards:**

| Card | Title | Fields |
|------|-------|--------|
| Basic Information | Feed identity | Feed Name, RSS URL, Target Vertical, Default Author |
| Import Settings | How content is imported | Import Mode, Article Status, Max Articles Per Sync, Duplicate Checking |
| Sync Schedule | Automation settings | Auto-sync toggle, Sync Interval |
| Content & Media | Processing and media | Strip Images, Strip Styles, Source Attribution, Default Featured Image |

**2. Layout improvements per card:**

- **Card 1:** 2-column grid for all 4 fields (balanced)
- **Card 2:** 3-column grid for top row (Import Mode, Status, Max Articles), then full-width duplicate checking
- **Card 3:** 2-column grid (Auto-sync toggle next to Interval input)
- **Card 4:** Stacked full-width sections for toggles and image upload

**3. Visual enhancements:**
- Each card gets a descriptive icon in the header
- Smaller padding between cards (`space-y-4` instead of `space-y-6`)
- Consistent use of muted backgrounds for toggle groups
- Move "Max Articles Per Sync" next to Import Mode/Status to fix the orphaned field issue

**4. Keep the same form structure and data flow:**
- No changes to `formData` state or mutation logic
- Same validation and submit behavior
- Just reorganizing the visual presentation

## Benefits
- Clearer visual hierarchy with logical groupings
- Balanced grid layouts (no orphaned fields)
- Easier to scan and understand form purpose
- Related settings are grouped together
- More compact feel while maintaining all functionality
