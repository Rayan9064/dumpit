# Title: perf: fetch collections only in dashboard

## Summary

This PR optimizes the CollectionsContext to prevent unnecessary API calls on every route change. Previously, collections were fetched automatically on context mount, causing calls to `/api/collections` even on non-dashboard pages. Now, collections are only fetched when explicitly needed in the dashboard component.

## Changes

- **CollectionsContext.tsx**: Removed `useEffect` hooks that automatically fetch collections on mount. Added `fetchSharedCollections` to the context interface and value for manual fetching.
- **Dashboard.tsx**: Added `useEffect` to call `refreshCollections` and `fetchSharedCollections` only when the dashboard component mounts and user is available.

## Related issues

- Addresses performance issue where collections API is called unnecessarily on every route.

## Files changed (high-level)

- `src/contexts/CollectionsContext.tsx`
- `src/components/Dashboard.tsx`

## Checklist for reviewers

- [ ] Confirm collections are still loaded correctly in the dashboard.
- [ ] Confirm no collections API calls occur on non-dashboard routes (e.g., login, add resource modal).
- [ ] Confirm shared collections are still fetched for the dashboard.
- [ ] Confirm collection operations (add/remove) still work in the dashboard.

## How to test locally

1. Checkout the branch: `git checkout perf/fetch-collections-only-in-dashboard`
2. Run dev server: `npm run dev`
3. Open browser devtools network tab.
4. Navigate to login page → verify no `/api/collections` calls.
5. Login and go to dashboard → verify `/api/collections?uid=...` and `/api/collections?shared=true` are called.
6. Navigate between dashboard tabs → verify no additional collection fetches.
7. Test collection operations (add resource to collection) → verify they work.

## Notes for maintainers

- This change improves performance by reducing API calls on non-dashboard pages.
- Collections are now lazy-loaded only where needed, reducing initial load times for other routes.