import { useState, useEffect } from 'react';
import { AppState, INITIAL_STATE } from '../types';

const APP_KEY = 'neuroflow_os_data_v2';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(APP_KEY);
    if (!saved) return INITIAL_STATE;
    try {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_STATE, ...parsed };
    } catch (e) {
      console.error("Failed to parse state", e);
      return INITIAL_STATE;
    }
  });

  const resetStorage = () => {
    (window as any).__NEUROFLOW_RESETTING = true;
    localStorage.clear();
    localStorage.removeItem(APP_KEY);
    sessionStorage.clear();
    window.location.href = window.location.origin;
  };

  useEffect(() => {
    if ((window as any).__NEUROFLOW_RESETTING) return;
    localStorage.setItem(APP_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState, resetStorage] as const;
}
