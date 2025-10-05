import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SharedDocument {
  id: string;
  job_id: string | null;
  title: string;
  document_type: string;
  content: any;
  version: number;
  created_by: string;
  last_edited_by: string | null;
  last_edited_at: string;
  created_at: string;
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  permission: string;
  last_viewed_at: string | null;
  created_at: string;
}

export interface DocumentEdit {
  id: string;
  document_id: string;
  user_id: string;
  change_type: string;
  change_data: any;
  created_at: string;
}

export const useCollaborativeDocument = (documentId?: string) => {
  const [document, setDocument] = useState<SharedDocument | null>(null);
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [edits, setEdits] = useState<DocumentEdit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      const { data, error } = await supabase
        .from('shared_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
      } else {
        setDocument(data);
      }
      setLoading(false);
    };

    const fetchCollaborators = async () => {
      const { data, error } = await supabase
        .from('document_collaborators')
        .select('*')
        .eq('document_id', documentId);

      if (!error) {
        setCollaborators(data || []);
      }
    };

    const fetchEdits = async () => {
      const { data, error } = await supabase
        .from('document_edits')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error) {
        setEdits(data || []);
      }
    };

    fetchDocument();
    fetchCollaborators();
    fetchEdits();

    // Subscribe to real-time updates
    const documentChannel = supabase
      .channel(`document:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_documents',
          filter: `id=eq.${documentId}`
        },
        (payload) => {
          setDocument(payload.new as SharedDocument);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_collaborators',
          filter: `document_id=eq.${documentId}`
        },
        () => {
          fetchCollaborators();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_edits',
          filter: `document_id=eq.${documentId}`
        },
        (payload) => {
          setEdits((prev) => [payload.new as DocumentEdit, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentChannel);
    };
  }, [documentId]);

  const updateDocument = useCallback(async (content: Record<string, any>) => {
    if (!documentId) return;

    const { error } = await supabase
      .from('shared_documents')
      .update({ content })
      .eq('id', documentId);

    if (error) throw error;
  }, [documentId]);

  const addCollaborator = useCallback(async (
    userId: string,
    permission: 'view' | 'edit' | 'admin'
  ) => {
    if (!documentId) return;

    const { error } = await supabase
      .from('document_collaborators')
      .insert({
        document_id: documentId,
        user_id: userId,
        permission
      });

    if (error) throw error;
  }, [documentId]);

  const removeCollaborator = useCallback(async (collaboratorId: string) => {
    const { error } = await supabase
      .from('document_collaborators')
      .delete()
      .eq('id', collaboratorId);

    if (error) throw error;
  }, []);

  return {
    document,
    collaborators,
    edits,
    loading,
    updateDocument,
    addCollaborator,
    removeCollaborator
  };
};
