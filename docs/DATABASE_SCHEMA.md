# Database Schema Documentation

## Overview

This document provides a comprehensive reference for all database tables, their relationships, RLS policies, and usage patterns.

## Core Tables

### profiles
User profile information extending auth.users

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- Primary key on `id`
- Index on `updated_at` for recent profiles

**RLS Policies:**
- `profiles_select_all`: Anyone can view all profiles
- `profiles_update_own`: Users can update their own profile
- `profiles_insert_own`: Users can insert their own profile

**Usage:**
```typescript
// Fetch profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Update profile
await supabase
  .from('profiles')
  .update({ full_name: 'John Doe' })
  .eq('id', userId);
```

---

### jobs
Job postings created by clients

```sql
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  service_id UUID REFERENCES public.services_micro(id),
  micro_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Audit tracking
  catalogue_version_used INTEGER,
  locale TEXT DEFAULT 'en',
  origin TEXT,
  
  -- Job details
  selected_items JSONB,
  total_estimated_price NUMERIC,
  preferred_dates JSONB,
  location_details TEXT,
  special_requirements TEXT,
  
  -- Structured answers
  micro_q_answers JSONB,
  general_answers JSONB
);
```

**Constraints:**
- `check_booking_dates`: Ensures `updated_at >= created_at`

**Indexes:**
- `idx_bookings_client_status`: Fast lookup by client and status
- `idx_bookings_service_status`: Fast lookup by service and status
- `idx_bookings_created`: Recent jobs first
- `idx_bookings_micro_slug`: Lookup by service slug

**RLS Policies:**
- `jobs_select_all`: Anyone can view jobs
- `jobs_insert_own`: Authenticated users can create jobs
- `jobs_update_own`: Clients can update their own jobs
- `jobs_delete_own`: Clients can delete their own jobs

**Usage:**
```typescript
// Create job (via wizard)
const { data, error } = await supabase
  .from('jobs')
  .insert({
    client_id: user.id,
    title: payload.title,
    description: payload.description,
    micro_slug: payload.microSlug,
    service_id: payload.serviceId,
    micro_q_answers: payload.microAnswers,
    general_answers: payload.logisticsAnswers
  })
  .select()
  .single();

// Query jobs
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'open')
  .order('created_at', { ascending: false });
```

---

### applications
Professional applications to jobs

```sql
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  cover_letter TEXT,
  proposed_rate NUMERIC,
  estimated_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_applications_job_professional`: Unique application per job per professional
- `idx_applications_job_status`: Fast lookup by job and status
- `idx_applications_professional`: Professional's application history

**RLS Policies:**
- `applications_select_own`: Professionals can view their applications, clients can view applications to their jobs
- `applications_insert_own`: Professionals can create applications
- `applications_update_status`: Clients can update application status

**Usage:**
```typescript
// Apply to job
await supabase
  .from('applications')
  .insert({
    job_id: jobId,
    professional_id: userId,
    cover_letter: letter,
    proposed_rate: rate
  });

// Get applications for job
const { data } = await supabase
  .from('applications')
  .select('*, profiles(*)')
  .eq('job_id', jobId)
  .order('created_at', { ascending: false });
```

---

### contracts
Active contracts between clients and professionals

```sql
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  tasker_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  agreed_amount NUMERIC NOT NULL,
  start_date DATE,
  end_date DATE,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Constraints:**
- `check_agreed_amount`: Ensures `agreed_amount >= 0`
- `check_contract_dates`: Ensures `end_date >= start_date`

**Indexes:**
- `idx_contracts_job`: One contract per job
- `idx_contracts_client_tasker`: Lookup by client and professional
- `idx_contracts_status`: Active contracts

**RLS Policies:**
- `contracts_select_party`: Parties can view their contracts
- `contracts_insert_client`: Clients can create contracts
- `contracts_update_party`: Parties can update contract status

---

### messages
Private messages between users

```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_messages_conversation_created`: Messages in conversation order
- `idx_messages_recipient_unread`: Unread message notifications

**RLS Policies:**
- `messages_select_party`: Sender and recipient can view messages
- `messages_insert_authenticated`: Authenticated users can send messages
- `messages_update_recipient`: Recipients can mark as read

**Realtime:**
```typescript
// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${userId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

---

### reviews
Reviews and ratings for completed jobs

```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  reviewee_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Constraints:**
- `check_rating_range`: Ensures `rating BETWEEN 1 AND 5`

**Indexes:**
- `idx_reviews_job`: One review per job per reviewer
- `idx_reviews_reviewee`: Professional's review history

**RLS Policies:**
- `reviews_select_all`: Anyone can view reviews
- `reviews_insert_party`: Contract parties can create reviews
- `reviews_update_own`: Reviewers can update their reviews (within 24h)

---

### payment_transactions
Payment and escrow tracking

```sql
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  transaction_type TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Constraints:**
- `check_payment_amount`: Ensures `amount > 0`

**Indexes:**
- `idx_payment_transactions_contract`: Payments for contract
- `idx_payment_transactions_user_status`: User's payment history
- `idx_payment_transactions_stripe`: Lookup by Stripe ID

**RLS Policies:**
- `payments_select_party`: Contract parties can view payments
- `payments_insert_client`: Clients can create payments
- `payments_update_system`: System can update payment status (service role)

---

## Monitoring Tables

### system_health_checks
Health check results for system monitoring

```sql
CREATE TABLE public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Usage:**
```typescript
import { HealthChecker } from '@/lib/monitoring/healthCheck';

const checker = new HealthChecker(supabase);
const results = await checker.runAllChecks();
```

---

### edge_function_errors
Edge Function error tracking

```sql
CREATE TABLE public.edge_function_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  request_data JSONB,
  user_id UUID,
  severity TEXT DEFAULT 'error',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Usage:**
```typescript
// Edge Function with error tracking
import { withErrorTracking } from '../_shared/errorHandler.ts';

Deno.serve(withErrorTracking(handler, 'my-function'));
```

---

### query_performance_log
Query performance monitoring

```sql
CREATE TABLE public.query_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  table_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Database Functions

### log_edge_function_error
Log errors from Edge Functions

```sql
CREATE OR REPLACE FUNCTION log_edge_function_error(
  p_function_name TEXT,
  p_error_message TEXT,
  p_error_stack TEXT DEFAULT NULL,
  p_request_data JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_severity TEXT DEFAULT 'error'
) RETURNS UUID
```

**Usage:**
```typescript
const errorId = await supabase.rpc('log_edge_function_error', {
  p_function_name: 'my-function',
  p_error_message: error.message,
  p_error_stack: error.stack,
  p_severity: 'critical'
});
```

---

### get_unresolved_errors_summary
Get summary of unresolved errors

```sql
CREATE OR REPLACE FUNCTION get_unresolved_errors_summary()
RETURNS TABLE (
  total_unresolved BIGINT,
  critical_count BIGINT,
  error_count BIGINT,
  warning_count BIGINT
)
```

**Usage:**
```typescript
const { data } = await supabase.rpc('get_unresolved_errors_summary');
console.log(data.total_unresolved);
```

---

## Best Practices

### 1. Always Use RLS Policies
Every table with user data must have RLS enabled:

```sql
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
```

### 2. Create Appropriate Indexes
Add indexes for frequently queried columns:

```sql
CREATE INDEX idx_table_column ON public.table(column);
CREATE INDEX idx_table_multi ON public.table(col1, col2) WHERE status = 'active';
```

### 3. Use JSONB for Flexible Data
Store structured but variable data in JSONB:

```sql
-- Good for: answers, metadata, settings
micro_q_answers JSONB
```

### 4. Add Constraints for Data Integrity
Enforce business rules at the database level:

```sql
ALTER TABLE table ADD CONSTRAINT check_positive_amount
CHECK (amount >= 0);
```

### 5. Use Triggers for Timestamps
Auto-update `updated_at` columns:

```sql
CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON public.table
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration Guidelines

### Creating Migrations

Always use the migration tool for database changes:

1. **Add new table**:
```sql
CREATE TABLE public.my_table (...);
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON public.my_table ...;
```

2. **Add column to existing table**:
```sql
ALTER TABLE public.my_table ADD COLUMN new_column TEXT;
CREATE INDEX idx_my_table_new_column ON public.my_table(new_column);
```

3. **Never use CHECK constraints for time-based validations**:
```sql
-- ❌ BAD - Immutable constraint
ALTER TABLE table ADD CONSTRAINT check_time CHECK (expire_at > now());

-- ✅ GOOD - Use trigger
CREATE TRIGGER validate_time BEFORE INSERT OR UPDATE ON table ...;
```

---

**Last Updated**: Phase 5 Implementation
**Related**: `docs/DEVELOPER_GUIDE.md`, `supabase/migrations/`
