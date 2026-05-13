import { useState, useEffect } from 'react';
import { AppState, INITIAL_STATE } from '../types';

const APP_KEY = 'neuroflow_os_data_v2';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(APP_KEY);
    if (!saved) return INITIAL_STATE;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse state", e);
      return INITIAL_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(APP_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}
