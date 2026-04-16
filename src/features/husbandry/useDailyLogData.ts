import { useMemo } from 'react';
import { useLiveQuery } from '@electric-sql/pglite-react';
import { getUKLocalDate } from '../../services/temporalService';
import { dailyLogsCollection, animalsCollection } from '../../lib/database';
import { LogEntry, AnimalCategory } from '../../types';

export const useDailyLogData = (viewDate: string, activeCategory: string) => {
  const result = useLiveQuery(`SELECT * FROM daily_logs ORDER BY created_at DESC;`);
  
  const dailyLogs = useMemo(() => {
     let logs = result?.rows || [];
     let resultLogs = logs.filter((log: any) => !log.is_deleted);
     
     if (viewDate !== 'all') {
        const targetDate = viewDate === 'today' ? getUKLocalDate() : viewDate;
        resultLogs = resultLogs.filter((log: any) => log.log_date === targetDate);
     }
     
     return resultLogs.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [result, viewDate]);

  const { data: animals = [] } = useLiveQuery(`SELECT * FROM animals WHERE is_deleted = false ORDER BY name ASC;`) || {};
  const filteredAnimals = useMemo(() => {
    return animals.filter((a: any) => {
      if (a.is_deleted || a.archived) return false;
      if (activeCategory === 'all') return true;
      return a.category === activeCategory;
    });
  }, [animals, activeCategory]);

  return {
    animals: filteredAnimals,
    dailyLogs,
    addLogEntry: async (entry: Partial<LogEntry>) => {
        await dailyLogsCollection.insert({
            id: entry.id || crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            isDeleted: false,
            ...entry
        });
    }, 
    updateLogEntry: async (id: string, entry: Partial<LogEntry>) => {
      await dailyLogsCollection.update(id, (old: LogEntry) => ({ 
          ...old, 
          ...entry, 
          id: old.id,
          updatedAt: new Date().toISOString()
      }));
    },
    deleteLogEntry: async (id: string) => {
        await dailyLogsCollection.update(id, (old: LogEntry) => ({ ...old, isDeleted: true }));
    },
    isLoading: animalsLoading || logsLoading
  };
};
