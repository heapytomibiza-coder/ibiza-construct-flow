# V1 Job Wizard Behavior Specification

**Extracted from**: `src/components/wizard/canonical/CanonicalJobWizard.tsx` and related files  
**Purpose**: Complete behavior reference for V2 rebuild

---

## 1. Step 0 UI + Logic (Category/Subcategory/Service Selection)

### Step 1: Main Category Selection

**File**: `src/components/wizard/db-powered/CategorySelector.tsx`

**Data Source**: Database-driven from `service_categories` table
```sql
SELECT * FROM service_categories WHERE is_active = true ORDER BY display_order
```

**Selection Behavior**:
- **Auto-advance**: Yes – clicking a category immediately advances to Step 2
- **No "Next" button** – selection IS the action

**UI**:
- Grid layout: `grid-cols-2 md:grid-cols-4 lg:grid-cols-5`
- Each tile shows: icon, name, 3 example services
- Selected state: `border-primary shadow-sm`

**State Update on Select**:
```typescript
setWizardState(prev => ({ 
  mainCategory: categoryName,
  mainCategoryId: categoryId,
  subcategory: '',        // Reset downstream
  subcategoryId: '',
  microNames: [], 
  microIds: [] 
}));
setCurrentStep(2); // Auto-advance
```

---

### Step 2: Subcategory Selection

**File**: `src/components/wizard/db-powered/SubcategorySelector.tsx`

**Data Source**: Database-driven from `service_subcategories` table
```sql
SELECT * FROM service_subcategories 
WHERE category_id = :categoryId AND is_active = true 
ORDER BY display_order
```

**Selection Behavior**:
- **Auto-advance**: Yes – clicking a subcategory immediately advances to Step 3
- Uses same pattern as CategorySelector

**State Update on Select**:
```typescript
setWizardState(prev => ({ 
  subcategory: subcategoryName,
  subcategoryId: subcategoryId,
  microNames: [], 
  microIds: [] 
}));
setCurrentStep(3); // Auto-advance
```

---

### Step 3: Micro Service Selection

**File**: `src/components/wizard/canonical/MicroStep.tsx`

**Data Source**: Database-driven from `service_micro_categories` table
```sql
SELECT id, name, slug, display_order, description
FROM service_micro_categories 
WHERE subcategory_id = :subcategoryId AND is_active = true 
ORDER BY display_order
```

**Selection Behavior**:
- **Multi-select**: Yes – users can select multiple tasks
- **Manual advance**: "Continue" button appears after ≥1 selection
- Toggle behavior: click to add, click again to remove

**UI**:
- Adaptive grid based on count:
  - ≤2 items: `grid-cols-2`
  - ≤4 items: `grid-cols-2 lg:grid-cols-4`
  - ≤6 items: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`
  - >6 items: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Each tile: icon, name, optional description
- Checkmark indicator for selected state

**State Update on Select**:
```typescript
onSelect(
  [...selectedMicros, micro.micro],      // names
  [...selectedMicroIds, micro.id],        // UUIDs
  [...selectedMicroSlugs, micro.slug]     // slugs
);
```

**Special Logic**: After micro selection, checks whether to skip Questions step:
```typescript
checkShouldSkipQuestions(microSlugs, micros);
```

---

## 2. Validation / Gating

### Per-Step "Next" Button Conditions

| Step | Condition to Enable "Next/Continue" |
|------|-------------------------------------|
| 1 (Category) | Auto-advances on click – no button |
| 2 (Subcategory) | Auto-advances on click – no button |
| 3 (Micro) | `selectedMicroIds.length > 0` |
| 4 (Questions) | Always enabled (skip optional) |
| 5 (Logistics) | See below |
| 6 (Extras) | Always enabled (optional step) |
| 7 (Review) | `!loading && user && microIds.length > 0` |

### Logistics Step Validation (`LogisticsStep.tsx:124-127`)
```typescript
const isComplete = logistics.location && 
                   (logistics.startDate || logistics.startDatePreset) && 
                   logistics.consultationType &&
                   logistics.budgetRange;
```

**Required Fields**:
1. `location` – must select from Ibiza locations dropdown
2. Start timing – either `startDate` (specific) OR `startDatePreset` (e.g., "This Week")
3. `consultationType` – one of: `site_visit`, `phone_call`, `video_call`
4. `budgetRange` – one of the preset ranges

**Optional Fields**:
- `customLocation` (only if location === "Other")
- `completionDate`
- `consultationDate`, `consultationTime`
- `accessDetails[]` (multi-select)

### Submission Gating (`CanonicalJobWizard.tsx:441-452`)
```typescript
if (!user) {
  toast.error('Please sign in to post a job');
  navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
  return;
}

if (wizardState.microIds.length === 0) {
  toast.error('Please select at least one service before submitting');
  return;
}
```

### Auto-Correction (Illegal State Prevention)
```typescript
if (currentStep >= 2 && !wizardState.mainCategory) setCurrentStep(1);
if (currentStep >= 3 && !wizardState.subcategory) setCurrentStep(2);
if (currentStep >= 4 && wizardState.microIds.length === 0) setCurrentStep(3);
```

---

## 3. Draft / Restore Logic

### Save Mechanism

**Primary**: Server-side to `form_sessions` table  
**Fallback**: `sessionStorage` key: `wizardState`

**Debounce**: 600ms after any state change
```typescript
useEffect(() => {
  if (!user || !isDirty) return;
  
  const timer = setTimeout(async () => {
    await supabase.from('form_sessions').upsert({
      user_id: user.id,
      form_type: 'job_post',
      payload: wizardState as any,
      updated_at: new Date().toISOString()
    });
    sessionStorage.setItem('wizardState', JSON.stringify(wizardState));
  }, 600);

  return () => clearTimeout(timer);
}, [wizardState, user, isDirty]);
```

### Restore Mechanism

**When**: On wizard mount, only if wizard is completely empty:
```typescript
const isWizardEmpty = !wizardState.mainCategory && 
                     !wizardState.subcategory && 
                     wizardState.microIds.length === 0;
```

**Modal Prompt**: `DraftRecoveryModal` asks user to resume or start fresh

**Flow**:
1. Check `form_sessions` table for existing draft
2. If found, show modal with draft age
3. Store draft in `sessionStorage.pendingDraft` temporarily
4. On "Resume" → merge into state
5. On "Start Fresh" → delete from server + clear storage

**Session Flag**: `sessionStorage.draftModalShown` prevents re-prompting

### Dirty Detection
```typescript
const [isDirty, setIsDirty] = useState(false);
const initialStateRef = useRef<string>('');

useEffect(() => {
  if (initialStateRef.current === '') {
    initialStateRef.current = JSON.stringify(wizardState);
  } else {
    setIsDirty(JSON.stringify(wizardState) !== initialStateRef.current);
  }
}, [wizardState]);
```

### Leave Warning
```typescript
window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  e.returnValue = '';
});
```

---

## 4. Publish Payload (Final Job Shape)

### Database Table: `jobs`

```typescript
await supabase.from('jobs').insert([{
  // Core identifiers
  client_id: user.id,
  micro_id: wizardState.microIds[0],  // Primary micro UUID
  
  // Title = combined micro names
  title: wizardState.microNames.join(' + '),
  
  // Description = notes or auto-generated
  description: wizardState.extras.notes || 
    `${combinedTitle} - ${mainCategory} / ${subcategory}`,
  
  // JSONB answers column
  answers: {
    microAnswers: wizardState.answers,
    selectedMicros: wizardState.microNames,
    selectedMicroIds: wizardState.microIds,
    logistics: {
      ...wizardState.logistics,
      // Dates converted to ISO strings
      startDate: startDate?.toISOString(),
      completionDate: completionDate?.toISOString(),
      consultationDate: consultationDate?.toISOString()
    },
    extras: {
      photos: wizardState.extras.photos,      // Base64 strings
      permitsConcern: wizardState.extras.permitsConcern
    }
  },
  
  // Budget parsing
  budget_type: budgetRange ? 'fixed' : 'hourly',
  budget_value: parseBudgetValue(budgetRange), // Extract number or null
  
  // Location JSONB
  location: {
    address: logistics.location,
    customLocation: logistics.customLocation,
    startDate: startDate?.toISOString(),
    completionDate: completionDate?.toISOString()
  },
  
  // Status
  status: 'open',
  
  // Idempotency (prevents duplicates)
  idempotency_key: `job-${userId.slice(0,8)}-${contentHash}-${timeBucket}`
}]);
```

### Budget Parsing Logic
```typescript
const parseBudgetValue = (input?: string) => {
  if (!input) return null;
  const cleaned = input.replace(/[^0-9.,]/g, '').replace(',', '.');
  const match = cleaned.match(/^\d+(\.\d+)?$/);
  return match ? Number(match[0]) : null;
};
```

### Idempotency Key Generation
```typescript
const timeBucket = Math.floor(Date.now() / (1000 * 60 * 60)); // 1-hour windows
const contentHash = btoa(JSON.stringify({
  userId: user.id,
  micros: wizardState.microIds.sort().join(','),
  location: wizardState.logistics.location,
})).slice(0, 32);
const idempotencyKey = `job-${user.id.slice(0, 8)}-${contentHash}-${timeBucket}`;
```

### Post-Submission Actions
1. Clear draft from `form_sessions` table
2. Clear `sessionStorage.wizardState`
3. Invoke `notify-job-broadcast` edge function (non-blocking)
4. Navigate to `/job-board?highlight=${newJob.id}`

---

## 5. Smart Behaviour

### A. Auto-Advance (Step 1 & 2)
- Category and Subcategory use `flushSync` + `setCurrentStep()` for instant progression
- No "Next" button – selection triggers advance

### B. Skip Questions Logic (`checkShouldSkipQuestions`)

Checks if Step 4 should be bypassed:
```typescript
const checkShouldSkipQuestions = async (microSlugs, microNames) => {
  // Priority 1: Check question_packs table
  const { data: pack } = await supabase
    .from('question_packs')
    .select('pack_id')
    .eq('micro_slug', primaryMicroSlug)
    .eq('status', 'approved')
    .eq('is_active', true)
    .maybeSingle();
  
  if (pack) { setSkipQuestions(false); return; }

  // Priority 2: Check static JSON
  const staticService = constructionServicesData.services.find(s => s.id === serviceId);
  if (staticService?.blocks?.length > 0) { setSkipQuestions(false); return; }

  // No questions = use fallback (don't skip, show generic)
  setSkipQuestions(false);
};
```

### C. Question Loading Hierarchy (`QuestionsStep.tsx`)

5-tier priority system:
1. **Tier -1**: Construction question blocks (local JSON with UUID)
2. **Tier 0**: Static JSON service definitions
3. **Tier 1**: Database `question_packs` table
4. **Tier 2**: AI-generated contextual questions (edge function)
5. **Tier 3**: Fallback generic questions (scope + urgency)

### D. Auto-Advance on Question Answer

In `QuestionsStep.tsx:434-442`:
```typescript
const handleTileSelect = (questionId: string, value: string) => {
  handleAnswerChange(questionId, value);
  // Auto-advance after selection with small delay
  setTimeout(() => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, 400);
};
```

### E. Conditional Question Visibility

```typescript
const shouldShowQuestion = (question: AIQuestion): boolean => {
  if (!question.meta?.show_if) return true;
  
  return question.meta.show_if.some((condition) => {
    const relatedAnswer = answers[condition.question];
    if (!relatedAnswer) return false;
    return condition.equals_any.includes(String(relatedAnswer));
  });
};
```

### F. One-Question-at-a-Time Engine

- Only shows selection-based questions (radio, select, checkbox, yesno)
- Text/textarea fields are filtered OUT
- Progress bar: `((currentQuestionIndex + 1) / visibleQuestions.length) * 100`
- Animation with Framer Motion between questions

### G. Quick Notes Chips (Extras Step)

Pre-defined note snippets users can tap to add:
```typescript
const COMMON_NOTE_KEYS = [
  'ecoFriendly',
  'minDisruption',
  'largerRenovation',
  'matchStyle',
  'historicBuilding',
  'completionCertificate'
];
```

---

## 6. Hardcoded Data (Ibiza-Specific)

### Locations (`LogisticsStep.tsx:38-59`)
```typescript
const IBIZA_LOCATIONS = [
  'Ibiza Town (Eivissa)',
  'San Antonio (Sant Antoni)',
  'Santa Eulalia (Santa Eulària)',
  "Playa d'en Bossa",
  'Talamanca',
  'Figueretas',
  'San José (Sant Josep)',
  'San Juan (Sant Joan)',
  'San Miguel (Sant Miquel)',
  'San Rafael (Sant Rafel)',
  'San Lorenzo (Sant Llorenç)',
  'Santa Gertrudis',
  'Jesus (Jesús)',
  'Portinatx',
  'Cala Llonga',
  'Es Canar',
  'Cala de Sant Vicent',
  'San Carlos (Sant Carles)',
  'San Agustin (Sant Agustí)',
  'Other'
];
```

### Budget Ranges
```typescript
const BUDGET_RANGES = [
  { key: '0-500', value: '€0-500' },
  { key: '500-1000', value: '€500-1,000' },
  { key: '1000-2500', value: '€1,000-2,500' },
  { key: '2500-5000', value: '€2,500-5,000' },
  { key: '5000+', value: '€5,000+' },
  { key: 'unsure', value: 'Unsure' }
];
```

### Start Date Presets
```typescript
const START_DATE_PRESETS = [
  { key: 'startAsap', value: 'Start ASAP' },
  { key: 'thisWeek', value: 'This Week' },
  { key: 'nextWeek', value: 'Next Week' },
  { key: 'within2Weeks', value: 'Within 2 Weeks' },
  { key: 'withinMonth', value: 'Within a Month' },
  { key: 'flexible', value: 'Flexible' }
];
```

### Consultation Times
```typescript
const CONSULTATION_TIMES = [
  { key: 'morning', value: 'Morning (8-12)' },
  { key: 'afternoon', value: 'Afternoon (12-17)' },
  { key: 'evening', value: 'Evening (17-20)' },
  { key: 'flexible', value: 'Flexible' }
];
```

### Access Options
```typescript
const ACCESS_OPTIONS = [
  { key: 'streetParking', value: 'Street level parking' },
  { key: 'undergroundParking', value: 'Underground parking' },
  { key: 'noParking', value: 'No parking nearby' },
  { key: 'elevator', value: 'Elevator available' },
  { key: 'stairsOnly', value: 'Stairs only' },
  { key: 'gatedCommunity', value: 'Gated community' },
  { key: 'codeKeys', value: 'Code/keys needed' },
  { key: 'reception', value: 'Building reception' },
  { key: 'easyAccess', value: 'Easy access' },
  { key: 'limitedAccess', value: 'Limited access' }
];
```

---

## 7. WizardState Interface

```typescript
interface WizardState {
  mainCategory: string;
  mainCategoryId: string;
  subcategory: string;
  subcategoryId: string;
  microNames: string[];
  microIds: string[];
  microUuids: string[];
  microSlugs: string[];
  answers: Record<string, any>;
  logistics: {
    location: string;
    customLocation?: string;
    startDate?: Date;
    startDatePreset?: string;
    completionDate?: Date;
    consultationType?: 'site_visit' | 'phone_call' | 'video_call';
    consultationDate?: Date;
    consultationTime?: string;
    accessDetails?: string[];
    budgetRange?: string;
  };
  extras: {
    photos: string[];  // Base64 encoded
    notes?: string;
    permitsConcern?: boolean;
  };
}
```

---

## 8. URL State Sync

Step position is synced to URL query param:
```typescript
// Read from URL on mount
const stepFromUrl = parseInt(searchParams.get('step') || '1', 10);

// Sync to URL on change
useEffect(() => {
  const newParams = new URLSearchParams(searchParams);
  newParams.set('step', String(currentStep));
  setSearchParams(newParams, { replace: true });
}, [currentStep]);
```

---

## Summary for V2 Recreation

1. **Category/Subcategory**: DB-driven, auto-advance on select
2. **Micro Services**: Multi-select, manual advance
3. **Questions**: Tiered loading, one-at-a-time, auto-advance on answer
4. **Logistics**: 4 required fields (location, timing, consultation, budget)
5. **Extras**: Optional photos/notes/permits
6. **Review**: Summary with submit button
7. **Drafts**: 600ms debounced save to server + sessionStorage fallback
8. **Submission**: Idempotency key, status='open', notify edge function
