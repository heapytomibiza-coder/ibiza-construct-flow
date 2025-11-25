# Question Packs Audit - Minimal Typing & Tile Options

## Issues Found

### 1. Type Inconsistency Across Packs

**Canonical Types** (from `src/types/packs.ts`):
- `single` - single select (radio/tile) ✅
- `multi` - multi select (checkbox/tile) ✅
- `scale` - scale selector ✅
- `yesno` - yes/no toggle ✅
- `text` - text input ❌ (typing required)
- `number` - number input ❌ (typing required)
- `file` - file upload ✅

**Types Currently Used** (inconsistent):
- `select` ❌ Should be `single`
- `radio` ❌ Should be `single`
- `checkbox` ❌ Should be `multi`
- `textarea` ❌ Should be `text` or converted to `single` with options
- `text` ⚠️ Minimize usage
- `number` ⚠️ Minimize usage

### 2. Typing Required Fields

**Gardening & Landscaping**:
- Generic pack has `textarea` for "description" - convert to optional `text` or remove
- Generic pack has `textarea` for "access_details" - convert to `single` with common options
- Regular maintenance has `textarea` for "access_details" - convert to `single`

**Legal & Regulatory**:
- Generic pack has `text` for "location_municipality" - keep (essential info)
- Has multiple `textarea` fields - need to audit

### 3. Recommendations

#### High Priority
1. **Standardize all types** to canonical types:
   - Replace `select` → `single`
   - Replace `radio` → `single`
   - Replace `checkbox` → `multi`
   - Replace `textarea` → `text` (only when essential)

2. **Minimize typing** by converting to select options:
   - "access_details" → `single` with options: ["Gate code needed", "Key collection required", "Through house", "Free access", "Other (add note)"]
   - "description" fields → Make optional or use structured questions instead

#### Medium Priority
3. **Add `yesno` type** where appropriate:
   - "Do you need X?" questions → `yesno` instead of `single` with yes/no options

4. **Use `multi` for "select all"** questions:
   - Any question where multiple selections make sense

## Action Plan

1. Update all gardening packs to use canonical types
2. Update all legal/regulatory packs to use canonical types
3. Convert textarea fields to structured options where possible
4. Review all other category packs (construction, electrical, plumbing, etc.)
5. Update seeding functions to handle canonical types correctly

## Type Mapping Reference

```typescript
// Current (wrong) → Canonical (correct)
'select'    → 'single'
'radio'     → 'single'
'checkbox'  → 'multi'
'textarea'  → 'text' (minimize usage) or 'single' with options
'text'      → Keep only for essential free-form input (names, locations, etc.)
'number'    → Convert to 'single' with range options where possible
```
