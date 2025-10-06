import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedTaskList {
  id: string;
  name: string;
  job_id?: string;
  owner_id: string;
  collaborators: string[];
  created_at: string;
  updated_at: string;
}

export interface SharedTask {
  id: string;
  task_list_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useSharedTaskList = (taskListId?: string) => {
  const [taskList, setTaskList] = useState<SharedTaskList | null>(null);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch task list and tasks
  useEffect(() => {
    if (!taskListId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch task list
        const { data: listData, error: listError } = await (supabase as any)
          .from('shared_task_lists')
          .select('*')
          .eq('id', taskListId)
          .single();

        if (listError) throw listError;
        setTaskList(listData as SharedTaskList);

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await (supabase as any)
          .from('shared_tasks')
          .select('*')
          .eq('task_list_id', taskListId)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData as SharedTask[]);
      } catch (error) {
        console.error('Error fetching task list:', error);
        toast({
          title: 'Error',
          description: 'Failed to load task list',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const tasksChannel = supabase
      .channel(`tasks:${taskListId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_tasks',
          filter: `task_list_id=eq.${taskListId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as SharedTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === payload.new.id ? (payload.new as SharedTask) : task
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [taskListId, toast]);

  // Create task
  const createTask = async (
    title: string,
    description?: string,
    assignedTo?: string,
    priority: SharedTask['priority'] = 'medium',
    dueDate?: string
  ) => {
    if (!taskListId) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { error } = await (supabase as any).from('shared_tasks').insert({
      task_list_id: taskListId,
      title,
      description,
      assigned_to: assignedTo,
      priority,
      due_date: dueDate,
      created_by: user.data.user.id,
      status: 'todo'
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<SharedTask>) => {
    const { error } = await (supabase as any)
      .from('shared_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  // Complete task
  const completeTask = async (taskId: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    await updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: user.data.user.id
    });
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    const { error } = await (supabase as any)
      .from('shared_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  return {
    taskList,
    tasks,
    loading,
    createTask,
    updateTask,
    completeTask,
    deleteTask
  };
};
