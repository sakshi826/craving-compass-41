import { useState, useEffect, useCallback } from 'react';
import { CravingLog } from '@/types/craving';

const STORAGE_KEY = 'cravingLogs';

function loadLogs(): CravingLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: CravingLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function useCravingLogs() {
  const [logs, setLogs] = useState<CravingLog[]>(loadLogs);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const addLog = useCallback((log: CravingLog) => {
    setLogs(prev => [log, ...prev]);
  }, []);

  const removeLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return { logs, addLog, removeLog, todayLogs };
}
