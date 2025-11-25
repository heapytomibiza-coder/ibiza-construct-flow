# Dispute Resolution System Specification

## Overview
This document outlines the complete dispute resolution feature for CS Ibiza, enabling clients and professionals to resolve conflicts with admin mediation.

## User Stories

### As a Client
- I want to file a dispute if the professional's work is unsatisfactory
- I want to provide evidence (photos, descriptions) to support my claim
- I want to track the status of my dispute
- I want to communicate with the admin mediator
- I want a fair resolution process

### As a Professional
- I want to respond to disputes filed against me
- I want to provide counter-evidence
- I want to maintain a good reputation by resolving disputes fairly
- I want clear dispute criteria to avoid unfair claims

### As an Admin
- I want to review all active disputes
- I want to see evidence from both parties
- I want to communicate with both parties
- I want to make fair resolution decisions
- I want to track dispute patterns to improve platform

---

## Database Schema

### disputes table
```sql
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  filed_by UUID NOT NULL REFERENCES profiles(id),
  filed_against UUID NOT NULL REFERENCES profiles(id),
  dispute_type TEXT NOT NULL, -- 'quality', 'payment', 'timeline', 'communication', 'other'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'under_review', 'pending_response', 'resolved', 'closed'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Initial filing
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  desired_outcome TEXT, -- What the filer wants (refund, redo work, etc)
  amount_disputed DECIMAL(10,2),
  
  -- Evidence
  evidence_urls TEXT[], -- Array of file/photo URLs
  evidence_metadata JSONB, -- File names, types, upload dates
  
  -- Response
  respondent_statement TEXT,
  respondent_evidence_urls TEXT[],
  respondent_evidence_metadata JSONB,
  responded_at TIMESTAMPTZ,
  
  -- Admin handling
  assigned_admin_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  admin_notes TEXT,
  
  -- Resolution
  resolution_type TEXT, -- 'full_refund', 'partial_refund', 'redo_work', 'no_action', 'other'
  resolution_amount DECIMAL(10,2), -- Amount to refund/adjust
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  
  -- Timeline
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[], -- For categorization
  internal_flags JSONB, -- Admin-only flags
  escalation_reason TEXT
);

-- Indexes
CREATE INDEX idx_disputes_contract ON disputes(contract_id);
CREATE INDEX idx_disputes_job ON disputes(job_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_assigned_admin ON disputes(assigned_admin_id);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);

-- RLS Policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Clients and professionals can see their own disputes
CREATE POLICY "Users can view their own disputes"
  ON disputes FOR SELECT
  USING (
    auth.uid() = filed_by 
    OR auth.uid() = filed_against
  );

-- Users can create disputes for their own contracts
CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = filed_by);

-- Users can update their own responses
CREATE POLICY "Respondents can update their response"
  ON disputes FOR UPDATE
  USING (auth.uid() = filed_against)
  WITH CHECK (auth.uid() = filed_against);

-- Admins can see and manage all disputes
CREATE POLICY "Admins can manage all disputes"
  ON disputes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### dispute_messages table
```sql
CREATE TABLE public.dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  sender_role TEXT NOT NULL, -- 'client', 'professional', 'admin'
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'status_update', 'evidence', 'resolution'
  content TEXT NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN DEFAULT false, -- Admin-only messages
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at DESC);

ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages in their disputes (non-internal)
CREATE POLICY "Users can view dispute messages"
  ON dispute_messages FOR SELECT
  USING (
    NOT is_internal AND
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_messages.dispute_id
      AND (disputes.filed_by = auth.uid() OR disputes.filed_against = auth.uid())
    )
  );

-- Users can send messages in their disputes
CREATE POLICY "Users can send dispute messages"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_messages.dispute_id
      AND (disputes.filed_by = auth.uid() OR disputes.filed_against = auth.uid())
    )
  );

-- Admins see all messages including internal
CREATE POLICY "Admins can manage all dispute messages"
  ON dispute_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### dispute_timeline table
```sql
CREATE TABLE public.dispute_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'filed', 'assigned', 'response_received', 'evidence_added', 'status_changed', 'resolved', 'closed'
  event_description TEXT NOT NULL,
  performed_by UUID REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dispute_timeline_dispute ON dispute_timeline(dispute_id);
CREATE INDEX idx_dispute_timeline_created_at ON dispute_timeline(created_at DESC);

ALTER TABLE dispute_timeline ENABLE ROW LEVEL SECURITY;

-- Same visibility as disputes
CREATE POLICY "Users can view their dispute timeline"
  ON dispute_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_timeline.dispute_id
      AND (disputes.filed_by = auth.uid() OR disputes.filed_against = auth.uid())
    )
  );

CREATE POLICY "Admins can manage dispute timeline"
  ON dispute_timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## UI Components

### 1. DisputeDialog Component
**Location**: `src/components/disputes/DisputeDialog.tsx`

**Props**:
```tsx
interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  jobId: string;
  professionalId: string;
  professionalName: string;
}
```

**Features**:
- Multi-step form:
  1. Select dispute type
  2. Describe issue
  3. Upload evidence (photos/files)
  4. Desired outcome
- Character limit on description (500-1000 chars)
- File upload validation (max 5 files, 10MB each)
- Preview uploaded photos
- Clear "Submit Dispute" CTA
- Warning message about dispute impact

**Validation**:
- Required: type, description, desired outcome
- Optional: evidence files
- Auto-calculate disputed amount if refund requested

---

### 2. DisputeDetailPage Component
**Location**: `src/pages/DisputeDetailPage.tsx`

**URL**: `/disputes/:disputeId`

**Sections**:
1. **Header**:
   - Dispute ID, status badge
   - Title and type
   - Filed date
   - Involved parties (filer + respondent)

2. **Case Details**:
   - Original description
   - Disputed amount
   - Desired outcome
   - Evidence gallery (photos/files)

3. **Response Section** (if respondent):
   - Response statement
   - Counter-evidence
   - Response date

4. **Timeline**:
   - All events (filed, assigned, responded, status changes)
   - Visual timeline component

5. **Communication Thread**:
   - Messages between parties and admin
   - Real-time updates
   - File attachments

6. **Actions** (role-based):
   - **For Filer**: Add evidence, withdraw dispute
   - **For Respondent**: Submit response, add evidence
   - **For Admin**: Assign to self, change status, add resolution

---

### 3. DisputeListPage Component
**Location**: `src/pages/DisputeListPage.tsx`

**URL**: `/disputes` (clients/pros) or `/admin/disputes` (admins)

**Features**:
- Tabbed view:
  - All
  - Open
  - Under Review
  - Resolved
  - Closed
- Filters:
  - Dispute type
  - Priority
  - Date range
  - Assigned admin (admin view only)
- Search by dispute ID or job title
- Sortable columns:
  - Filed date
  - Status
  - Priority
  - Amount disputed
- Pagination (20 per page)
- Quick actions:
  - View details
  - Change status (admin)
  - Assign to me (admin)

**Card Layout**:
```
┌─────────────────────────────────────────┐
│ 🔴 High Priority  |  STATUS BADGE      │
│ Dispute #12345                          │
│ "Poor quality bathroom installation"    │
│                                         │
│ Job: Bathroom Renovation                │
│ Amount: €2,500                          │
│ Filed: Nov 20, 2025 by John Smith      │
│                                         │
│ [View Details] [Assign to Me] (admin)  │
└─────────────────────────────────────────┘
```

---

### 4. RespondToDisputeDialog Component
**Location**: `src/components/disputes/RespondToDisputeDialog.tsx`

**Props**:
```tsx
interface RespondToDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
  disputeDescription: string;
}
```

**Features**:
- Read-only view of original dispute
- Text area for response statement
- Upload counter-evidence
- Character limit (500-1000 chars)
- "Submit Response" button
- Auto-notification to filer and admin

---

### 5. ResolveDisputeDialog Component (Admin only)
**Location**: `src/components/disputes/ResolveDisputeDialog.tsx`

**Props**:
```tsx
interface ResolveDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
  disputeFacts: {
    jobTitle: string;
    disputedAmount: number;
    filerName: string;
    respondentName: string;
  };
}
```

**Features**:
- Resolution type dropdown:
  - Full refund to client
  - Partial refund (specify amount)
  - Redo work by professional
  - No action (dispute invalid)
  - Custom resolution
- Amount input (if refund)
- Resolution notes (required, min 100 chars)
- Warning: "This decision is final and will notify both parties"
- "Resolve Dispute" button

---

## User Flows

### Flow 1: Client Files Dispute

```
1. Client goes to Job Detail Page
2. Clicks "File Dispute" button (if job status = completed or closed)
3. DisputeDialog opens:
   a. Select type: "Quality of Work"
   b. Describe: "The bathroom tiles are uneven and cracked"
   c. Upload photos: 3 photos showing issues
   d. Desired outcome: "Redo tile installation or refund €1,500"
4. Submit dispute
5. Success toast: "Dispute filed. You'll hear back within 24 hours"
6. Redirect to /disputes/:disputeId
7. Professional and admin receive email notifications
```

---

### Flow 2: Professional Responds to Dispute

```
1. Professional receives email: "A dispute has been filed against you"
2. Professional logs in, sees notification badge
3. Clicks notification → Goes to /disputes/:disputeId
4. Reads client's complaint and evidence
5. Clicks "Submit Response"
6. RespondToDisputeDialog opens:
   a. Write response: "The tiles were installed per industry standards..."
   b. Upload photos: Before/after photos, material receipts
7. Submit response
8. Success toast: "Response submitted. Admin will review within 48 hours"
9. Client and admin notified
```

---

### Flow 3: Admin Reviews and Resolves Dispute

```
1. Admin logs in to /admin/disputes
2. Sees list of open disputes, sorted by priority
3. Clicks "Assign to Me" on Dispute #12345
4. Goes to /disputes/:disputeId
5. Reviews:
   - Client's complaint + photos
   - Professional's response + photos
   - Job contract details
6. Sends message to both parties asking clarifying questions
7. After investigation, clicks "Resolve Dispute"
8. ResolveDisputeDialog opens:
   a. Select resolution: "Partial refund"
   b. Amount: €750 (50% of disputed amount)
   c. Notes: "Based on evidence, tiles show minor defects but are functional..."
9. Submit resolution
10. Both parties receive email with decision
11. Escrow automatically processes refund (if applicable)
12. Dispute status → "Resolved"
```

---

## Email Notifications

### 1. Dispute Filed (to Professional & Admin)
**Subject**: 🚨 Dispute Filed - Action Required [Job #123]

**Body**:
> A dispute has been filed regarding [Job Title].
> 
> **Filed by**: [Client Name]
> **Type**: Quality of Work
> **Amount**: €1,500
> 
> [View Dispute Details]
> 
> Please respond within 48 hours.

---

### 2. Response Received (to Client & Admin)
**Subject**: ✅ Response Received on Dispute [#12345]

**Body**:
> [Professional Name] has responded to your dispute.
> 
> [View Response]
> 
> An admin will review and make a decision within 2-3 business days.

---

### 3. Dispute Resolved (to Both Parties)
**Subject**: ⚖️ Dispute Resolved - [Job #123]

**Body**:
> The admin has reviewed your dispute and made a decision.
> 
> **Resolution**: Partial refund
> **Amount**: €750
> **Explanation**: [Admin notes]
> 
> [View Full Details]
> 
> This decision is final. If you have concerns, please contact support.

---

## Admin Dashboard Metrics

### Disputes Widget
**Location**: Admin Dashboard homepage

**Metrics**:
- Total open disputes
- Average resolution time
- Disputes resolved this month
- Client win rate vs Professional win rate
- Most common dispute types (pie chart)

---

## Implementation Priority

### Phase 1: MVP (Week 1-2)
- [ ] Database tables and RLS policies
- [ ] DisputeDialog component
- [ ] DisputeDetailPage (read-only)
- [ ] Basic dispute listing
- [ ] Email notifications

### Phase 2: Responses (Week 3)
- [ ] RespondToDisputeDialog
- [ ] Communication thread
- [ ] Evidence upload/gallery
- [ ] Timeline component

### Phase 3: Admin Tools (Week 4)
- [ ] Admin dispute dashboard
- [ ] ResolveDisputeDialog
- [ ] Assignment system
- [ ] Internal notes
- [ ] Bulk actions

### Phase 4: Advanced Features (Week 5+)
- [ ] Auto-refund processing via Stripe
- [ ] Dispute analytics
- [ ] AI-assisted resolution suggestions
- [ ] Professional reputation impact
- [ ] Dispute prevention (early warnings)

---

## Business Rules

### Eligibility to File Dispute
- Job status must be "completed" or "closed"
- Must file within 30 days of job completion
- Cannot file if already disputed the same job
- Payment must have been made

### Response Deadline
- Professionals have 48 hours to respond
- If no response, admin can decide unilaterally
- Extensions possible with admin approval

### Resolution Impact
- Refunds processed within 5 business days
- Professional rating may be affected
- Both parties can appeal (one time only)

### Escalation Triggers
- Disputed amount > €5,000 (high priority)
- Professional has 3+ disputes (flag account)
- Client has 5+ disputes filed (potential abuse)

---

**Status**: Specification Complete
**Ready for Implementation**: ✅ Yes
**Estimated Development Time**: 4-5 weeks (1 developer)

---

This specification provides everything needed to build a complete dispute resolution system. Implement in phases based on demo priorities.
