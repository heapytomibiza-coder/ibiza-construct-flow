
# Export All Question Packs to CSV

## Overview

Add a comprehensive CSV export feature for all question packs. This will create a downloadable CSV file containing pack metadata and flattened question data for all 329+ active packs.

---

## Export Format

The CSV will include two levels of data:

### Pack-Level Export (Summary)
| Column | Description |
|--------|-------------|
| micro_slug | Unique identifier |
| pack_name | Display name from content |
| category | Category from content |
| status | approved/draft/retired |
| version | Pack version number |
| is_active | true/false |
| question_count | Number of questions |
| source | manual/ai/hybrid |
| created_at | Creation timestamp |
| approved_at | Approval timestamp |

### Question-Level Export (Detailed)
| Column | Description |
|--------|-------------|
| micro_slug | Parent pack identifier |
| pack_name | Parent pack name |
| question_index | Position (1, 2, 3...) |
| question_key | Unique question key |
| question_type | text/single/multi/yesno/etc |
| question_text | aiHint or i18nKey |
| required | true/false |
| options | Comma-separated option values |
| option_labels | Comma-separated option labels |

---

## Implementation

### 1. Add Export Functions

**File**: `src/pages/admin/QuestionPackAudit.tsx`

Add two export buttons:
- **Export Pack Summary** - One row per pack with metadata
- **Export All Questions** - One row per question with pack context

New export functions:
- `exportPackSummary()` - Exports pack metadata
- `exportAllQuestions()` - Exports flattened question data

---

### 2. UI Changes

Add export buttons to the existing header section:

```text
┌─────────────────────────────────────────────────────────┐
│ Question Pack Audit                                      │
│ Comprehensive validation of all 329 question packs      │
│                                                          │
│ [Go to Tone Standardizer] [Export Summary ▼]            │
│                            └── Pack Summary (CSV)        │
│                            └── All Questions (CSV)       │
│                            └── Issues Report (CSV)       │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Export Pack Summary Function

```typescript
const exportPackSummary = () => {
  const rows = packsWithIssues.map(p => ({
    micro_slug: p.micro_slug,
    pack_name: p.content?.name || '',
    category: p.content?.category || '',
    status: p.status,
    version: p.version,
    is_active: p.is_active,
    question_count: p.questionCount,
    source: p.source || 'unknown',
    created_at: p.created_at,
    approved_at: p.approved_at || '',
    issues_count: p.issues.length
  }));
  
  // Convert to CSV and download
};
```

### Export All Questions Function

```typescript
const exportAllQuestions = () => {
  const rows: any[] = [];
  
  packsWithIssues.forEach(pack => {
    (pack.content?.questions || []).forEach((q, idx) => {
      rows.push({
        micro_slug: pack.micro_slug,
        pack_name: pack.content?.name || '',
        question_index: idx + 1,
        question_key: q.key || '',
        question_type: q.type || '',
        question_text: q.aiHint || q.i18nKey || q.title || '',
        required: q.required ? 'true' : 'false',
        options: (q.options || []).map(o => o.value).join('|'),
        option_labels: (q.options || []).map(o => o.i18nKey || o.label || o.value).join('|')
      });
    });
  });
  
  // Convert to CSV and download
};
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/QuestionPackAudit.tsx` | Add `exportPackSummary()` and `exportAllQuestions()` functions, update UI with dropdown menu |

---

## Output Files

1. **question-packs-summary-YYYY-MM-DD.csv** - ~330 rows (one per pack)
2. **question-packs-all-questions-YYYY-MM-DD.csv** - ~2000+ rows (one per question)
3. **question-pack-audit-YYYY-MM-DD.csv** - Existing issues report (unchanged)

---

## Outcome

Admin users can download a complete export of all question packs in CSV format for:
- Offline review and editing
- Spreadsheet analysis
- Backup purposes
- Bulk content auditing
- Sharing with stakeholders
