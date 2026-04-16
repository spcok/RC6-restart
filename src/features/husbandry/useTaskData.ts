import { useLiveQuery } from '@electric-sql/pglite-react';
import { tasksCollection } from '../../lib/database';
import { Task } from '../../types';

export const useTaskData = () => {
  const result = useLiveQuery(`SELECT * FROM tasks ORDER BY due_date ASC;`);
  
  const isEngineLoading = result?.rows === undefined;
  const safeRows = (result?.rows || []) as Task[];

  return { 
    tasks: safeRows.filter((t: any) => !t.is_deleted), 
    isLoading: isEngineLoading, 
    error: result?.error,
    // [PRESERVED MUTATION HOOKS - AS REQUESTED]
    addTask: async (newTask: Partial<Task>) => {
      const task = { ...newTask, id: newTask.id || crypto.randomUUID(), isDeleted: false };
      await tasksCollection.insert(task);
    }, 
    completeTask: async (taskId: string) => {
      await tasksCollection.update(taskId, { completed: true });
    },
    deleteTask: async (taskId: string) => {
      await tasksCollection.delete(taskId);
    }
  };
};
