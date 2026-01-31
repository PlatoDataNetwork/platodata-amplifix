

# Update CORS Settings for articles-api Edge Function

## Summary
Update the `articles-api` edge function to allow cross-origin requests from `ai.platodata.io` in addition to the existing `dashboard.platodata.io`.

---

## Important Note About Your Current Error

The 401 "Invalid or missing API key" error in your screenshot is **not a CORS issue**. Since you're running the sync from a Laravel CLI command (server-side), CORS doesn't apply - it only affects browser-based requests.

**To fix the 401 error, verify:**
1. Your Laravel `.env` has the correct `PLATO_API_KEY` value
2. Run `php artisan config:clear` after updating `.env`
3. The API key matches what's stored in Supabase Edge Function secrets

---

## Technical Changes

### File: `supabase/functions/articles-api/index.ts`

**Current Configuration (Line 3-6):**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.platodata.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}
```

**New Configuration:**
```typescript
// Helper to check allowed origins
const allowedOrigins = [
  'https://dashboard.platodata.io',
  'https://ai.platodata.io'
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  };
};
```

**Updated Request Handler:**
- Modify the `Deno.serve` function to extract the `Origin` header from incoming requests
- Use `getCorsHeaders(origin)` instead of static `corsHeaders` throughout the function
- This allows dynamic CORS based on the requesting origin

---

## Implementation Details

1. **Dynamic Origin Handling**: The function will check if the request's `Origin` header matches one of the allowed origins and respond with that specific origin in the CORS header

2. **Fallback Behavior**: If the origin isn't recognized or isn't present (like server-side requests), it falls back to the first allowed origin

3. **All Response Types Updated**: Both success and error responses will use the dynamic CORS headers

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/articles-api/index.ts` | Update CORS to support multiple origins dynamically |

---

## After Implementation

The edge function will be automatically redeployed. You can verify the CORS change by:
1. Making a request from `ai.platodata.io` in the browser
2. Checking the response headers include `Access-Control-Allow-Origin: https://ai.platodata.io`

