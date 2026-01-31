
# Fix Articles API Pagination Performance

## Problem
The current `articles-api` uses OFFSET-based pagination which becomes extremely slow with large datasets. At offset 23,800+, PostgreSQL times out because it must scan through all previous rows.

## Solution
Implement cursor-based pagination using `published_at` and `id` as cursor values. This allows the database to use indexes efficiently regardless of how deep into the dataset you're paginating.

---

## Technical Changes

### File: `supabase/functions/articles-api/index.ts`

**Current Approach (Slow):**
```typescript
query = query.range(offset, offset + limit - 1)
```

**New Approach (Fast - Cursor-based):**
```typescript
// Use cursor parameters instead of offset
const cursor_published_at = url.searchParams.get('cursor_published_at')
const cursor_id = url.searchParams.get('cursor_id')

// Filter using WHERE instead of OFFSET
if (cursor_published_at && cursor_id) {
  query = query
    .or(`published_at.lt.${cursor_published_at},and(published_at.eq.${cursor_published_at},id.lt.${cursor_id})`)
}

query = query.limit(limit)
```

### API Changes

**New Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `cursor_published_at` | ISO timestamp from the last article's `published_at` |
| `cursor_id` | UUID from the last article's `id` |
| `limit` | Number of articles per page (default: 100) |

**Backward Compatibility:**
- Keep supporting `offset` for existing integrations
- Add `cursor_published_at` and `cursor_id` for new cursor-based approach
- Return `next_cursor` in the response for easy iteration

**Response Format Update:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 100,
    "total": 597659,
    "next_cursor": {
      "published_at": "2025-01-30T10:00:00Z",
      "id": "abc-123-def"
    }
  }
}
```

---

## Laravel Command Updates

Your `SyncPlatoArticles` command will need a small update to use cursor-based pagination:

```php
private function fetchArticles(?string $vertical, int $limit): array
{
    $allArticles = [];
    $cursorPublishedAt = null;
    $cursorId = null;
    $batchSize = 100;

    $this->info('Fetching articles from API...');

    do {
        $params = [
            'limit' => ($limit > 0 && $limit < $batchSize) ? $limit : $batchSize,
        ];

        // Use cursor-based pagination instead of offset
        if ($cursorPublishedAt && $cursorId) {
            $params['cursor_published_at'] = $cursorPublishedAt;
            $params['cursor_id'] = $cursorId;
        }

        if ($vertical) {
            $params['vertical'] = $vertical;
        }

        $this->line("Fetching batch with cursor: published_at={$cursorPublishedAt}");

        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
        ])->timeout(120)->get($this->apiUrl, $params);

        // ... rest of error handling ...

        $articles = $data['data'] ?? [];
        $this->totalArticles = $data['pagination']['total'] ?? 0;

        $allArticles = array_merge($allArticles, $articles);

        // Get cursor from last article for next batch
        if (!empty($articles)) {
            $lastArticle = end($articles);
            $cursorPublishedAt = $lastArticle['published_at'];
            $cursorId = $lastArticle['id'];
        }

        // Stop conditions
        if ($limit > 0 && count($allArticles) >= $limit) {
            $allArticles = array_slice($allArticles, 0, $limit);
            break;
        }

        if (count($articles) < $batchSize) {
            break;
        }

    } while (true);

    return $allArticles;
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/articles-api/index.ts` | Add cursor-based pagination support |

---

## Performance Comparison

| Pagination Type | Offset 0 | Offset 10,000 | Offset 100,000 |
|-----------------|----------|---------------|----------------|
| OFFSET-based | ~100ms | ~2s | Timeout |
| Cursor-based | ~100ms | ~100ms | ~100ms |

Cursor-based pagination maintains consistent performance regardless of how deep you paginate.

---

## After Implementation

1. Redeploy the edge function
2. Update your Laravel command to use cursor parameters
3. Re-run the sync - it should complete without timeouts
