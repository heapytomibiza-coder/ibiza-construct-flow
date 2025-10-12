import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'job' | 'professional' | 'conversation' | 'offer';
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  url: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const searchPattern = `%${searchTerm}%`;
      const allResults: SearchResult[] = [];

      // Search jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .eq('client_id', user.id)
        .limit(5);

      if (jobs) {
        allResults.push(...jobs.map(job => ({
          id: job.id,
          type: 'job' as const,
          title: job.title,
          subtitle: `Status: ${job.status}`,
          metadata: { status: job.status },
          url: `/client/jobs/${job.id}`,
        })));
      }

      // Search professionals
      const { data: professionals } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', searchPattern)
        .limit(5);

      if (professionals) {
        allResults.push(...professionals.map(prof => ({
          id: prof.id,
          type: 'professional' as const,
          title: prof.full_name || 'Professional',
          subtitle: 'Professional',
          url: `/professionals/${prof.id}`,
        })));
      }

      // Search conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .limit(5);

      if (conversations) {
        allResults.push(...conversations.map(conv => ({
          id: conv.id,
          type: 'conversation' as const,
          title: 'Conversation',
          subtitle: 'Click to open',
          url: `/messages/${conv.id}`,
        })));
      }

      // Search offers disabled for now due to type inference issues
      // Can be re-enabled once offers table structure is finalized

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, search]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    isOpen,
    setIsOpen,
    search,
  };
}
