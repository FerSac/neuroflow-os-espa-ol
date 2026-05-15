/**
 * Types and interfaces for NeuroFlow OS 2.0
 */

export type Priority = 'p1' | 'p2' | 'p3';
export type Category = 'trabajo' | 'personal' | 'urgente' | 'idea' | 'compra';
export type View = 
  | 'dashboard' | 'morning' | 'tasks' | 'timer' 
  | 'braindump' | 'energy' | 'impulse' | 'dopamine' 
  | 'habits' | 'cycle' | 'meds' | 'sleep' 
  | 'rescue' | 'rsd' | 'bodydouble' | 'wins' 
  | 'travel' | 'settings' | 'guide';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  created: string;
  completedAt?: string;
  subtasks: SubTask[];
}

export interface BrainDump {
  id: string;
  text: string;
  category: Category;
  created: string;
}

export interface Win {
  id: string;
  text: string;
  type: 'task' | 'manual' | 'habit' | 'default';
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  days: boolean[]; // 7 days
  created: string;
}

export interface Med {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  log: Record<string, boolean>; // date string -> completed
}

export interface TravelItem {
  id: string;
  text: string;
  category: 'essentials' | 'comfort' | 'tech';
  checked: boolean;
}

export interface EnergyLog {
  date: string;
  value: number;
  timestamp: string;
}

export interface SleepLog {
  date: string;
  hours: number;
  quality: number;
  sleepTime: string;
  wakeTime: string;
}

export interface AppState {
  tasks: Task[];
  brainDumps: BrainDump[];
  wins: Win[];
  habits: Habit[];
  meds: Med[];
  travelItems: TravelItem[];
  energyLogs: EnergyLog[];
  sleepLogs: SleepLog[];
  settings: {
    theme: string;
    mode: string;
    hyperfocusGuard: boolean;
    sounds: boolean;
    confetti: boolean;
    timerDuration: number;
    bodyDoubleType: 'focus' | 'calm' | 'cheer';
    language: 'es' | 'en';
    userName: string;
  };
  dailyPriority: string;
  launchCompleted: boolean;
  timerState: {
    running: boolean;
    timeLeft: number;
    totalTime: number;
    sessionsToday: number;
    totalFocusMinutes: number;
  };
  energyToday: number;
  cycleStartDate: string;
  healthNotes: string;
  currentView: View;
  rsdAnswers: string[];
  bodyDoubleIntention: string;
}

export const INITIAL_STATE: AppState = {
  tasks: [],
  brainDumps: [],
  wins: [],
  habits: [],
  meds: [],
  travelItems: [],
  energyLogs: [],
  sleepLogs: [],
  settings: {
    theme: 'default',
    mode: 'standard',
    hyperfocusGuard: true,
                sounds: true,
                confetti: true,
                timerDuration: 25,
                bodyDoubleType: 'focus',
                language: 'en',
                userName: 'Explorer'
  },
  dailyPriority: '',
  launchCompleted: false,
  timerState: {
    running: false,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    sessionsToday: 0,
    totalFocusMinutes: 0
  },
  energyToday: 5,
  cycleStartDate: '',
  healthNotes: '',
  currentView: 'dashboard',
  rsdAnswers: ['', '', ''],
  bodyDoubleIntention: ''
};
