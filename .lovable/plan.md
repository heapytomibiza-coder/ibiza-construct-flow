

# Disable Mobile Filters Plan

## What's Being Disabled

Mobile filter UI elements across the app that appear on small screens. This affects:

| Component | Location | What It Does |
|-----------|----------|--------------|
| Job Board floating actions | Bottom of screen | Bell, Filter, Scroll-to-top buttons |
| Job Board filter button | Above job listings | "Filters" button with badge |
| Discovery filter sheet | Left slide-in | Full filter panel on mobile |
| Discovery search bar filter toggle | Search area | Filter button next to search |

---

## Implementation

### 1. Job Board Page - Remove Floating Actions

**File**: `src/pages/JobBoardPage.tsx`

Remove the `JobBoardFloatingActions` component import and usage entirely. This removes the floating filter/notification bar at the bottom of the screen on mobile.

---

### 2. Jobs Marketplace - Hide Mobile Filter Button

**File**: `src/components/marketplace/JobsMarketplace.tsx`

Remove the mobile filter button (currently visible only on `lg:hidden`). The filter panel trigger will be disabled on mobile.

---

### 3. Discovery Page - Disable Mobile Filter Sheet

**File**: `src/pages/Discovery.tsx`

- Remove or disable the mobile filter `Sheet` component
- Modify `UnifiedSearchBar` to not show the filter toggle on mobile
- Keep desktop sidebar filters intact

---

### 4. Unified Search Bar - Conditionally Hide Filter Button

**File**: `src/components/discovery/UnifiedSearchBar.tsx`

Add `hidden sm:flex` class to the filter button so it only appears on tablet and larger screens.

---

## Files Changed

| File | Change |
|------|--------|
| `JobBoardPage.tsx` | Remove `JobBoardFloatingActions` component |
| `JobsMarketplace.tsx` | Remove mobile filter button (lines 359-377) |
| `Discovery.tsx` | Remove mobile Sheet filter (lines 262-280) |
| `UnifiedSearchBar.tsx` | Hide filter button on mobile |

---

## What Stays Working

- Desktop filters remain fully functional
- Search functionality remains on mobile
- Tablet and larger screens keep filter access
- No data or backend changes needed

---

## Outcome

Mobile users will see a cleaner interface without filter buttons/panels. They can still:
- Search for services/jobs
- Browse listings
- View all content

Filtering is temporarily a desktop/tablet feature until mobile filters are refined.

