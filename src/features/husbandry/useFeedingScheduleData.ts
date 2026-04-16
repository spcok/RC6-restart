import { useLiveQuery } from '@electric-sql/pglite-react';
import { LogType } from '../../types';

export function useFeedingScheduleData(date: string) {
  const result = useLiveQuery(`SELECT * FROM daily_logs WHERE log_type = 'Feeding' ORDER BY created_at DESC;`);
  
  const isEngineLoading = result?.rows === undefined;
  const safeRows = result?.rows || [];
  
  const feedingLogs = safeRows.filter((l: any) => l.log_date === date && l.log_type === LogType.FEED);

  return { 
    data: feedingLogs, 
    feedingLogs: feedingLogs,
    isLoading: isEngineLoading, 
    error: result?.error 
  };
}
