import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSharedTaskList } from '@/hooks/useSharedTaskList';
import { Plus, Trash2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SharedTaskListProps {
  taskListId: string;
}

const priorityColors = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

export const SharedTaskList = ({ taskListId }: SharedTaskListProps) => {
  const { taskList, tasks, loading, createTask, updateTask, completeTask, deleteTask } =
    useSharedTaskList(taskListId);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      await updateTask(taskId, { status: 'todo', completed_at: undefined });
    } else {
      await completeTask(taskId);
    }
  };

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {taskList?.name || 'Shared Tasks'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new task */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
          />
          <Button onClick={handleCreateTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={() => handleToggleTask(task.id, task.status)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${priorityColors[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                  </span>
                  {task.due_date && (
                    <span>Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
                  )}
                  {task.completed_at && (
                    <span className="text-green-600">
                      ✓ Completed {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks yet. Create one to get started!
            </div>
          )}
        </div>

        {/* Task statistics */}
        <div className="pt-4 border-t flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <span className="text-muted-foreground">
              Total: <strong>{tasks.length}</strong>
            </span>
            <span className="text-muted-foreground">
              Completed:{' '}
              <strong>{tasks.filter((t) => t.status === 'completed').length}</strong>
            </span>
            <span className="text-muted-foreground">
              In Progress:{' '}
              <strong>{tasks.filter((t) => t.status === 'in_progress').length}</strong>
            </span>
          </div>
          <div className="text-muted-foreground">
            {tasks.length > 0 &&
              `${Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)}% complete`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
