/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Rocket, 
  Target, 
  Timer, 
  Brain, 
  Zap, 
  XOctagon, 
  Gamepad2, 
  RefreshCw, 
  Moon, 
  Pill, 
  CloudMoon, 
  AlertCircle, 
  ShieldCheck, 
  Users, 
  Trophy, 
  Plane, 
  Calendar,
  Settings,
  Menu,
  Bell,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Upload,
  Database,
  AlertTriangle,
  FileJson,
  Lightbulb,
  Globe,
  Palette,
  Layout,
  Sparkles,
  Wand2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useAppState } from './hooks/useAppState';
import { breakdownTask, summarizeBrainDump } from './lib/gemini';
import { View, Task, Priority, Category, INITIAL_STATE, Win } from './types';
import { translations, Language } from './lib/translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Utilities ---
const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.1) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio not supported", e);
  }
};

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#9b8ec4', '#f8b4c8', '#81c784']
  });
};

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  badge 
}: { 
  icon: React.ElementType, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  badge?: number
}) => (
  <li 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium",
      active 
        ? "bg-linear-to-br from-primary-light to-secondary-light text-primary-dark font-semibold" 
        : "text-text-secondary hover:bg-hover hover:text-text-main"
    )}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </li>
);

export default function App() {
  const [state, setState, resetStorage] = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const t = useCallback((key: string): string => {
    const lang = (state.settings.language as Language) || 'en';
    return (translations[lang] as any)[key] || key;
  }, [state.settings.language]);

  useEffect(() => {
    document.documentElement.className = state.settings.theme;
  }, [state.settings.theme]);

  // Focus Guardian (90m Reminder)
  useEffect(() => {
    if (!state.settings.hyperfocusGuard) return;

    const interval = setInterval(() => {
      if (state.settings.sounds) playSound(880, 'square', 0.3);
      alert(t('focusGuardianAlert') || "🧠 Focus Guardian: You've been working for 90 minutes. Take a 5-minute break!");
    }, 90 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.settings.hyperfocusGuard, state.settings.sounds, t]);

  const navigateTo = (view: View) => {
    setState(prev => ({ ...prev, currentView: view }));
    setSidebarOpen(false);
  };

  const getActiveTasksCount = () => state.tasks.filter(t => !t.completed).length;

  const getNotifications = () => {
    const list = [];
    const today = new Date().toDateString();
    
    if (!state.dailyPriority) {
      list.push({
        title: t('definePriority'),
        desc: t('definePriorityDesc'),
        icon: Target,
        color: 'text-primary',
        action: () => navigateTo('morning')
      });
    }

    const medsTaken = state.meds.some((m: any) => m.log[today]);
    if (state.meds.length > 0 && !medsTaken) {
      list.push({
        title: t('medsCheck'),
        desc: t('medsCheckDesc'),
        icon: Pill,
        color: 'text-danger',
        action: () => navigateTo('meds')
      });
    }

    if (state.energyToday <= 3) {
      list.push({
        title: t('criticalEnergy'),
        desc: t('criticalEnergyDesc'),
        icon: Zap,
        color: 'text-warning',
        action: () => navigateTo('rescue')
      });
    }

    const pendingTasks = state.tasks.filter(t => !t.completed).length;
    if (pendingTasks > 5) {
      list.push({
        title: t('overloadDetected'),
        desc: t('overloadDetectedDesc').replace('{n}', pendingTasks.toString()),
        icon: AlertCircle,
        color: 'text-accent',
        action: () => navigateTo('tasks')
      });
    }

    // Dynamic Tips
    const tips = t('tips') as unknown as string[];
    const tipIndex = (new Date().getDate()) % tips.length;
    
    list.push({
      title: t('dailyStrategy'),
      desc: tips[tipIndex],
      icon: Lightbulb,
      color: 'text-warning',
      action: () => {}
    });

    return list;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border-main p-5 z-50 transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <div className="font-display font-bold text-text-main">NeuroFlow OS</div>
            <div className="text-[10px] text-text-muted font-normal uppercase tracking-wider">{t('adhdCommandCentre')}</div>
          </div>
        </div>

        <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 scrollbar-thin">
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">{t('principal')}</div>
            <ul className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label={t('dashboard')} active={state.currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
              <SidebarItem icon={Rocket} label={t('morning')} active={state.currentView === 'morning'} onClick={() => navigateTo('morning')} />
              <SidebarItem icon={Target} label={t('tasks')} active={state.currentView === 'tasks'} onClick={() => navigateTo('tasks')} badge={getActiveTasksCount()} />
              <SidebarItem icon={Timer} label={t('timer')} active={state.currentView === 'timer'} onClick={() => navigateTo('timer')} />
              <SidebarItem icon={Lightbulb} label={t('guide')} active={state.currentView === 'guide'} onClick={() => navigateTo('guide')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">{t('brainSection')}</div>
            <ul className="space-y-1">
              <SidebarItem icon={Brain} label={t('braindump')} active={state.currentView === 'braindump'} onClick={() => navigateTo('braindump')} />
              <SidebarItem icon={Zap} label={t('energy')} active={state.currentView === 'energy'} onClick={() => navigateTo('energy')} />
              <SidebarItem icon={XOctagon} label={t('impulse')} active={state.currentView === 'impulse'} onClick={() => navigateTo('impulse')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">{t('wellness')}</div>
            <ul className="space-y-1">
              <SidebarItem icon={Gamepad2} label={t('dopamine')} active={state.currentView === 'dopamine'} onClick={() => navigateTo('dopamine')} />
              <SidebarItem icon={RefreshCw} label={t('habits')} active={state.currentView === 'habits'} onClick={() => navigateTo('habits')} />
              <SidebarItem icon={Moon} label={t('cycle')} active={state.currentView === 'cycle'} onClick={() => navigateTo('cycle')} />
              <SidebarItem icon={Pill} label={t('meds')} active={state.currentView === 'meds'} onClick={() => navigateTo('meds')} />
              <SidebarItem icon={CloudMoon} label={t('sleep')} active={state.currentView === 'sleep'} onClick={() => navigateTo('sleep')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">{t('rescueSection')}</div>
            <ul className="space-y-1">
              <SidebarItem icon={AlertCircle} label={t('rescue')} active={state.currentView === 'rescue'} onClick={() => navigateTo('rescue')} />
              <SidebarItem icon={ShieldCheck} label={t('rsd')} active={state.currentView === 'rsd'} onClick={() => navigateTo('rsd')} />
              <SidebarItem icon={Users} label={t('bodydouble')} active={state.currentView === 'bodydouble'} onClick={() => navigateTo('bodydouble')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">{t('more')}</div>
            <ul className="space-y-1">
              <SidebarItem icon={Trophy} label={t('wins')} active={state.currentView === 'wins'} onClick={() => navigateTo('wins')} />
              <SidebarItem icon={Plane} label={t('travel')} active={state.currentView === 'travel'} onClick={() => navigateTo('travel')} />
              <SidebarItem icon={Settings} label={t('settings')} active={state.currentView === 'settings'} onClick={() => navigateTo('settings')} />
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-border-main">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-hover rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-text-main capitalize">
                {t(`viewTitle_${state.currentView}`) || state.currentView.replace(/([A-Z])/g, ' $1')}
              </h1>
              <p className="text-xs text-text-muted">
                {t(`viewSubtitle_${state.currentView}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div 
              className="hidden sm:flex items-center gap-3 bg-card border border-border-main px-4 py-2 rounded-2xl cursor-pointer hover:bg-hover"
              onClick={() => navigateTo('energy')}
            >
              <Zap className="w-4 h-4 text-warning" />
              <div className="w-16 h-1.5 bg-border-main rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-danger via-warning to-accent transition-all duration-500" 
                  style={{ width: `${state.energyToday * 10}%` }}
                />
              </div>
              <span className="text-xs font-bold text-text-main">{state.energyToday}/10</span>
            </div>

            <button 
              onClick={() => navigateTo('rescue')}
              className="w-10 h-10 border border-border-main bg-card rounded-xl flex items-center justify-center hover:bg-hover text-danger shadow-sm"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setNotifPanelOpen(!notifPanelOpen)}
                className={cn(
                  "relative w-10 h-10 border border-border-main bg-card rounded-xl flex items-center justify-center hover:bg-hover shadow-sm transition-all focus:ring-2 focus:ring-primary/40 outline-none",
                  notifPanelOpen && "ring-2 ring-primary border-primary"
                )}
                title={t('notifCenterTitle')}
              >
                <Bell className={cn("w-5 h-5 transition-colors", getNotifications().length > 0 ? "text-primary fill-primary/10 animate-pulse-slow" : "text-text-muted")} />
                {getNotifications().length > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger border-2 border-card rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </button>

              <AnimatePresence>
                {notifPanelOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setNotifPanelOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-card border border-border-main rounded-2xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5"
                    >
                      <div className="p-4 border-b border-border-main bg-linear-to-r from-primary/10 to-secondary/10 font-display font-bold text-sm text-text-main flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-primary" />
                          <span>{t('notifTitle')}</span>
                        </div>
                        <button onClick={() => setNotifPanelOpen(false)} className="text-text-muted hover:text-text-main p-1 hover:bg-hover rounded-md transition-colors"><Plus className="w-4 h-4 rotate-45" /></button>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {getNotifications().length > 0 ? getNotifications().map((notif, i) => (
                          <div 
                            key={i} 
                            onClick={() => { notif.action(); setNotifPanelOpen(false); }}
                            className="flex gap-3 p-3 rounded-xl hover:bg-hover cursor-pointer transition-all border border-transparent hover:border-border-main/50 group bg-card"
                          >
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs", notif.color.replace('text-', 'bg-') + '/10', notif.color)}>
                              <notif.icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-text-main group-hover:text-primary transition-colors flex items-center justify-between">
                                {notif.title}
                                <ChevronRight className="w-3 h-3 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                              </div>
                              <div className="text-[10px] text-text-secondary leading-tight mt-0.5">{notif.desc}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-12 px-4">
                            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10">
                              <CheckCircle2 className="w-6 h-6 text-primary/40" />
                            </div>
                            <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">{t('clearMind')}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{t('noNotifs')}</p>
                          </div>
                        )}
                      </div>
                      {getNotifications().length > 0 && (
                        <div className="p-3 bg-hover/30 border-t border-border-main text-center">
                           <p className="text-[9px] text-text-muted italic">{t('notifDisclaimer')}</p>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView(state, setState, navigateTo, resetStorage, t)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


const MorningLaunchView = ({ state, setState, navigateTo, t }: any) => {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(s => s + 1);

  const steps = [
    { title: t('morningStep1Title'), desc: t('morningStep1Desc'), emoji: '🌬️' },
    { title: t('morningStep2Title'), desc: t('morningStep2Desc'), emoji: '💊' },
    { title: t('morningStep3Title'), desc: t('morningStep3Desc'), emoji: '🎯' },
    { title: t('morningStep4Title'), desc: t('morningStep4Desc'), emoji: '✨' }
  ];

  if (step >= steps.length) {
    return (
      <div className="card text-center p-12">
        <div className="text-5xl mb-6">🚀</div>
        <h2 className="text-2xl font-display font-bold mb-2">{t('morningCompleteTitle')}</h2>
        <p className="text-text-secondary mb-8">{t('morningCompleteDesc').replace('{p}', state.dailyPriority)}</p>
        <button onClick={() => navigateTo('dashboard')} className="btn btn-primary btn-lg w-full">{t('morningCompleteButton')}</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={cn("w-full h-1.5 rounded-full transition-all duration-500", i <= step ? "bg-primary" : "bg-border-main")} />
        ))}
      </div>

      <motion.div 
        key={step} 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="card text-center p-10"
      >
        <div className="text-6xl mb-6 flex justify-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }}>
            {steps[step].emoji}
          </motion.div>
        </div>
        <h2 className="text-xl font-display font-bold mb-4">{steps[step].title}</h2>
        <p className="text-text-muted mb-8">{steps[step].desc}</p>

        {step === 1 && (
          <div className="flex gap-4 mb-8">
            <button onClick={nextStep} className="btn flex-1 btn-primary">{t('morningStep2Yes')}</button>
            <button onClick={nextStep} className="btn flex-1 btn-secondary">{t('morningStep2No')}</button>
          </div>
        )}

        {step === 2 && (
          <div className="mb-8">
            <input 
              autoFocus
              className="w-full text-center text-xl font-display font-bold border-b-2 border-primary-light outline-none py-2 focus:border-primary transition-all"
              placeholder={t('morningStep3Placeholder')}
              value={state.dailyPriority}
              onChange={e => setState((prev: any) => ({ ...prev, dailyPriority: e.target.value }))}
            />
          </div>
        )}

        {step !== 1 && (
          <button onClick={nextStep} className="btn btn-primary btn-lg w-full">{t('next')}</button>
        )}
      </motion.div>
    </div>
  );
};

const OverwhelmRescueView = ({ state, t }: any) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: t('rescueStep1Title'), desc: t('rescueStep1Desc') },
    { title: t('rescueStep2Title'), desc: t('rescueStep2Desc') },
    { title: t('rescueStep3Title'), desc: t('rescueStep3Desc') },
    { title: t('rescueStep4Title'), desc: t('rescueStep4Desc') }
  ];

  const handleComplete = (i: number) => {
    setStep(i + 1);
    if (state.settings.sounds) playSound(440 + (i * 100), 'sine', 0.1);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
          <div className="card border-2 border-danger-light bg-danger/5 text-center py-10">
            <AlertCircle className="w-12 h-12 mx-auto text-danger mb-4" />
            <h2 className="text-2xl font-display font-bold text-danger">{t('rescueModeTitle')}</h2>
            <p className="text-danger opacity-80">{t('rescueModeDesc')}</p>
          </div>

      {steps.map((s, i) => (
        <div key={i} className={cn(
          "card flex gap-4 items-start transition-all duration-500",
          step === i ? "border-primary ring-2 ring-primary-light scale-[1.02]" : step > i ? "border-accent bg-accent-light opacity-60" : "opacity-40"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0",
            step > i ? "bg-accent text-white" : "bg-primary text-white shadow-sm"
          )}>
            {step > i ? '✓' : i + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-text-main mb-1">{s.title}</h4>
            <p className="text-xs text-text-secondary mb-4">{s.desc}</p>
            {step === i && (
              <button 
                onClick={() => handleComplete(i)}
                className="btn btn-primary btn-sm"
              >
                {t('rescueStepComplete')}
              </button>
            )}
          </div>
        </div>
      ))}

      {step >= steps.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <p className="text-accent font-bold text-lg mb-4">{t('rescueAllDone')}</p>
          <button onClick={() => {
              setStep(0);
              if (state.settings.confetti) triggerConfetti();
          }} className="btn btn-secondary text-sm">{t('rescueRestart')}</button>
        </motion.div>
      )}
    </div>
  );
};

const EnergyTrackerView = ({ state, setState, t }: any) => {
  const updateEnergy = (val: number) => {
    setState((prev: any) => ({ ...prev, energyToday: val }));
  };

  const logEnergy = () => {
    const today = new Date().toDateString();
    const newLogs = [...state.energyLogs];
    const existingIdx = newLogs.findIndex(l => l.date === today);
    
    if (existingIdx >= 0) {
      newLogs[existingIdx] = { ...newLogs[existingIdx], value: state.energyToday };
    } else {
      newLogs.push({
        date: today,
        value: state.energyToday,
        timestamp: new Date().toISOString()
      });
    }

    setState((prev: any) => ({ ...prev, energyLogs: newLogs }));
    if (state.settings.sounds) playSound(660, 'sine', 0.2);
  };

  return (
    <div className="space-y-6">
      <div className="card text-center p-10">
        <h3 className="font-display font-bold mb-6">{t('energyAsk')}</h3>
        <div className="flex items-center justify-center gap-6 mb-8">
          <span className="text-2xl">😫</span>
          <input 
            type="range" 
            min="1" max="10" 
            value={state.energyToday} 
            onChange={(e) => updateEnergy(parseInt(e.target.value))}
            className="w-full max-w-xs accent-primary cursor-pointer"
          />
          <span className="text-2xl">🚀</span>
        </div>
        <div className="text-6xl font-display font-bold text-primary mb-4">{state.energyToday}</div>
        <button onClick={logEnergy} className="btn btn-primary px-8">{t('energyRegister')}</button>
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" /> {t('energyHistoryTitle')}
        </h3>
        <div className="flex items-end gap-3 h-48 pt-4 px-2">
          {state.energyLogs.slice(-7).map((log: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-text-main text-bg text-[10px] px-2 py-1 rounded-md pointer-events-none mb-1">
                {log.value}/10
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(log.value * 10, 5)}%` }}
                className="w-full bg-linear-to-t from-primary/30 to-primary rounded-t-lg transition-all duration-700 ease-out hover:from-primary/50" 
              />
              <span className="text-[10px] text-text-muted font-bold text-center mt-3 truncate">
                {new Date(log.date).toLocaleDateString([], { weekday: 'short' })}
              </span>
            </div>
          ))}
          {state.energyLogs.length === 0 && (
            <div className="w-full text-center text-text-muted py-20 text-xs flex flex-col items-center gap-2">
              <Database className="w-8 h-8 opacity-20" />
              {t('energyHistoryEmpty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DopamineMenuView = ({ state, setState, t }: any) => {
  const activities = [
    { emoji: '🧘', name: t('dopamine_stretches'), desc: t('dopamine_stretches_desc'), time: `2 ${t('minutesShort')}` },
    { emoji: '💃', name: t('dopamine_dance'), desc: t('dopamine_dance_desc'), time: `3 ${t('minutesShort')}` },
    { emoji: '🌬️', name: t('dopamine_breathing'), desc: t('dopamine_breathing_desc'), time: `2 ${t('minutesShort')}` },
    { emoji: '🎨', name: t('dopamine_doodle'), desc: t('dopamine_doodle_desc'), time: `5 ${t('minutesShort')}` },
    { emoji: '🚶', name: t('dopamine_walk'), desc: t('dopamine_walk_desc'), time: `15 ${t('minutesShort')}` },
    { emoji: '📦', name: t('dopamine_organize'), desc: t('dopamine_organize_desc'), time: `10 ${t('minutesShort')}` }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="text-sm text-text-secondary mb-6">{t('dopamineAsk')}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {activities.map((act, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 p-4 border border-border-main rounded-2xl hover:bg-hover hover:border-primary-light cursor-pointer transition-all group bg-card/50"
              onClick={() => {
                const win: Win = {
                    id: 'win_' + Date.now(),
                    text: `Dopamine booster: ${act.name}`,
                    type: 'default',
                    date: new Date().toISOString()
                };
                setState((prev: any) => ({ ...prev, wins: [win, ...prev.wins] }));
                if (state.settings.sounds) playSound(880, 'sine', 0.1);
                if (state.settings.confetti) triggerConfetti();
              }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{act.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-main">{act.name}</div>
                <div className="text-[10px] text-text-muted">{act.desc}</div>
              </div>
              <span className="text-[10px] font-bold text-primary">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HabitTrackerView = ({ state, setState, t }: any) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('🌱');

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const habit = {
      id: 'habit_' + Date.now(),
      name: newHabitName,
      icon: newHabitEmoji,
      streak: 0,
      days: [false, false, false, false, false, false, false],
      created: new Date().toISOString()
    };
    setState((prev: any) => ({ ...prev, habits: [...prev.habits, habit] }));
    setNewHabitName('');
  };

  const toggleDay = (habitId: string, dayIdx: number) => {
    const newHabits = state.habits.map((h: any) => {
      if (h.id === habitId) {
        const newDays = [...h.days];
        newDays[dayIdx] = !newDays[dayIdx];
        
        let streak = 0;
        for (let i = newDays.length - 1; i >= 0; i--) {
            if (newDays[i]) streak++;
            else break;
        }
        return { ...h, days: newDays, streak };
      }
      return h;
    });
    setState((prev: any) => ({ ...prev, habits: newHabits }));
  };

  const weekdays = t('weekdays') as unknown as string[];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex gap-2 mb-6">
          <input 
            value={newHabitEmoji}
            onChange={e => setNewHabitEmoji(e.target.value)}
            className="w-12 bg-hover border border-border-main rounded-xl text-center text-xl outline-none"
            maxLength={2}
          />
          <input 
            value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)}
            placeholder={t('newHabitPlaceholder')}
            className="flex-1 bg-hover border border-border-main rounded-xl px-4 text-sm font-medium outline-none focus:border-primary transition-all"
          />
          <button onClick={addHabit} className="btn btn-primary btn-sm">{t('add')}</button>
        </div>

        <div className="space-y-4">
          {state.habits.map((habit: any) => (
            <div key={habit.id} className="flex items-center gap-4 p-4 border border-border-main rounded-2xl bg-card/30">
              <span className="text-2xl">{habit.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-main">{habit.name}</div>
                <div className="text-[10px] text-text-muted">{t('habitStreak').replace('{n}', habit.streak)}</div>
              </div>
              <div className="flex gap-1.5">
                {weekdays.map((d, i) => (
                  <button 
                    key={i}
                    onClick={() => toggleDay(habit.id, i)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-[10px] font-bold border transition-all",
                      habit.days[i] ? "bg-accent border-accent text-white" : "border-border-main text-text-muted hover:border-primary-light bg-card"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setState((prev: any) => ({ ...prev, habits: prev.habits.filter((h: any) => h.id !== habit.id) }))}
                className="p-2 text-text-muted hover:text-danger"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {state.habits.length === 0 && (
            <div className="text-center py-10 text-text-muted">
              <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs">{t('habitNoHabits')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MedsView = ({ state, setState, t }: any) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');

  const addMed = () => {
    if (!name.trim()) return;
    const med = {
      id: 'med_' + Date.now(),
      name,
      dosage,
      frequency: t('medFrequencyOnce'),
      log: {}
    };
    setState((prev: any) => ({ ...prev, meds: [...prev.meds, med] }));
    setName('');
    setDosage('');
  };

  const toggleMed = (medId: string) => {
    const today = new Date().toDateString();
    const newMeds = state.meds.map((m: any) => {
      if (m.id === medId) {
        const newLog = { ...m.log };
        newLog[today] = !newLog[today];
        return { ...m, log: newLog };
      }
      return m;
    });
    setState((prev: any) => ({ ...prev, meds: newMeds }));
  };

  const today = new Date().toDateString();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="grid grid-cols-2 gap-2 mb-6">
          <input 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('medNamePlaceholder')}
            className="bg-hover border border-border-main rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-primary-light"
          />
          <input 
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder={t('medDosagePlaceholder')}
            className="bg-hover border border-border-main rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-primary-light"
          />
          <button onClick={addMed} className="col-span-2 btn btn-primary btn-sm">{t('addMedication')}</button>
        </div>

        <div className="space-y-3">
          {state.meds.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs uppercase font-bold tracking-widest">{t('noMeds')}</p>
            </div>
          ) : state.meds.map((med: any) => (
            <div key={med.id} className="flex items-center justify-between p-4 border border-border-main rounded-2xl bg-card/30">
              <div>
                <div className="text-sm font-bold text-text-main">{med.name}</div>
                <div className="text-[10px] text-text-muted">{med.dosage} - {med.frequency}</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleMed(med.id)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                    med.log[today] ? "bg-accent border-accent text-white" : "border-border-main text-text-muted bg-card"
                  )}
                >
                  {med.log[today] ? <CheckCircle2 className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setState((prev: any) => ({ ...prev, meds: prev.meds.filter((m: any) => m.id !== med.id) }))}
                  className="p-2 text-text-muted hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {state.meds.length === 0 && (
            <div className="text-center py-10 text-text-muted">
              <Pill className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs">{t('noMeds')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WinsJournalView = ({ state, setState, t }: any) => {
  const [text, setText] = useState('');

  const addWin = () => {
    if (!text.trim()) return;
    const win: Win = {
      id: 'win_' + Date.now(),
      text,
      type: 'manual',
      date: new Date().toISOString()
    };
    setState((prev: any) => ({ ...prev, wins: [win, ...prev.wins] }));
    setText('');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <textarea 
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('winPlaceholder')}
          className="w-full bg-hover border-none rounded-2xl px-4 py-3 text-sm font-medium outline-none min-h-[100px] mb-4 text-text-main"
        />
        <button onClick={addWin} className="btn btn-primary w-full">{t('registerWin')}</button>
      </div>

      <div className="space-y-3">
        {state.wins.map((win: any) => (
          <div key={win.id} className="flex gap-4 p-4 bg-[var(--bg-card)] border border-border-main rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
            <div className="text-2xl pt-1 group-hover:scale-110 transition-transform">🏆</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-text-main leading-tight">{win.text}</div>
              <div className="text-[10px] text-text-secondary uppercase mt-1 flex items-center gap-2 font-medium tracking-wider">
                <Calendar className="w-3 h-3 text-primary/60" />
                {new Date(win.date).toLocaleDateString()} • {new Date(win.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button 
                onClick={() => {
                  if (state.settings.sounds) playSound(200, 'sine', 0.1);
                  setState((prev: any) => ({ ...prev, wins: prev.wins.filter((w: any) => w.id !== win.id) }));
                }}
                className="p-1 px-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const RsdShieldView = ({ state, setState, t }: any) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const updateAnswer = (idx: number, val: string) => {
    const newAnswers = [...(state.rsdAnswers || ['', '', ''])];
    newAnswers[idx] = val;
    setState((prev: any) => ({ ...prev, rsdAnswers: newAnswers }));
  };

  const resetShield = () => {
    setState((prev: any) => ({ ...prev, rsdAnswers: ['', '', ''] }));
    setSelectedEmotion(null);
  };
  
  const affirmations: Record<string, string[]> = {
    'Rechazo': t('rsdAffirmations_Rechazo') as unknown as string[],
    'Crítica': t('rsdAffirmations_Crítica') as unknown as string[],
    'Inseguridad': t('rsdAffirmations_Inseguridad') as unknown as string[]
  };

  const emotions = [
    { id: 'Rechazo', label: t('rsdRejection') },
    { id: 'Crítica', label: t('rsdCriticism') },
    { id: 'Inseguridad', label: t('rsdInsecurity') }
  ];

  const currentAffirmations = selectedEmotion ? affirmations[selectedEmotion] : affirmations['Inseguridad'];

  return (
    <div className="space-y-6">
      <div className="card bg-linear-to-r from-primary-light/30 to-secondary-light/30 border-none text-center p-10 min-h-[300px] flex flex-col justify-center">
        <ShieldCheck className="w-12 h-12 mx-auto text-primary mb-6" />
        
        {!selectedEmotion ? (
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text-main">{t('rsdHowFeel')}</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {emotions.map(e => (
                <button 
                  key={e.id}
                  onClick={() => { setSelectedEmotion(e.id); setIndex(0); }}
                  className="btn btn-secondary btn-sm"
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            key={selectedEmotion + index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="font-display font-medium text-xl text-text-main italic leading-relaxed mb-8">
              "{currentAffirmations[index % currentAffirmations.length]}"
            </p>
            <div className="flex justify-center gap-2">
              <button 
                onClick={() => setSelectedEmotion(null)}
                className="btn btn-secondary btn-sm"
              >
                {t('rsdBack')}
              </button>
              <button 
                onClick={() => setIndex(index + 1)}
                className="btn btn-primary btn-sm"
              >
                {t('rsdAnotherAffirmation')}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-main">
          <div>
            <h3 className="font-display font-bold text-text-main">{t('rsdRealityCheckTitle')}</h3>
            <p className="text-xs text-text-secondary">{t('rsdRealityCheckSubtitle')}</p>
          </div>
          <button 
            onClick={resetShield}
            className="p-2 hover:bg-hover rounded-lg text-primary transition-colors flex items-center gap-2 text-xs font-bold"
            title={t('rsdReset')}
          >
            <RotateCcw className="w-4 h-4" /> {t('rsdReset')}
          </button>
        </div>

        <div className="space-y-6">
          {[
            t('rsdQuestion1'),
            t('rsdQuestion2'),
            t('rsdQuestion3'),
          ].map((q, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary-light flex items-center justify-center text-[10px] font-bold text-primary bg-card">
                  {i + 1}
                </div>
                <span className="text-xs font-bold text-text-main">{q}</span>
              </div>
              <textarea
                value={(state.rsdAnswers || ['', '', ''])[i] || ''}
                onChange={(e) => updateAnswer(i, e.target.value)}
                placeholder={t('rsdReflectionPlaceholder')}
                className="w-full bg-card/50 border border-border-main rounded-xl px-4 py-3 text-sm focus:border-primary-light focus:ring-2 focus:ring-primary-light outline-none min-h-[80px] transition-all resize-none text-text-main"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ state, setState, resetStorage, t }: any) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggle = (field: string) => {
    setState((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, [field]: !prev.settings[field] }
    }));
  };

  const setAppTheme = (theme: string) => {
    setState((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, theme }
    }));
  };

  const setAppLanguage = (language: string) => {
    setState((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, language }
    }));
  };

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setState({ ...INITIAL_STATE, ...parsed });
        if (state.settings.sounds) playSound(880, 'sine', 0.2);
        alert(t('importSuccess'));
      } catch (err) {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> {t('language')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'es', label: 'Español' },
            { id: 'en', label: 'English' },
          ].map(l => (
            <button 
              key={l.id}
              onClick={() => {
                setAppLanguage(l.id);
                if (state.settings.sounds) playSound(600, 'sine', 0.1);
              }}
              className={cn(
                "p-3 rounded-xl border flex items-center justify-center gap-3 transition-all cursor-pointer",
                state.settings.language === l.id ? "border-primary bg-primary-light/30 ring-2 ring-primary-light" : "border-border-main bg-card hover:border-primary-light"
              )}
            >
              <span className="text-xs font-bold text-text-main">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> {t('theme')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'default', label: t('theme_default'), colors: 'bg-primary' },
            { id: 'dark', label: t('theme_dark'), colors: 'bg-slate-900 border border-white/20' },
            { id: 'boho', label: t('theme_boho'), colors: 'bg-[#c4956a]' },
            { id: 'minimal', label: t('theme_minimal'), colors: 'bg-[#666]' },
          ].map(th => (
            <button 
              key={th.id}
              onClick={() => {
                setAppTheme(th.id);
                if (state.settings.sounds) playSound(600, 'sine', 0.1);
              }}
              className={cn(
                "p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer",
                state.settings.theme === th.id ? "border-primary bg-primary-light/30 ring-2 ring-primary-light" : "border-border-main bg-card hover:border-primary-light"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full", th.colors)} />
              <span className="text-xs font-bold text-text-main">{th.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" /> {t('interfacePrefs')}
          </h3>
          {state.settings.sounds && (
            <button 
              onClick={() => playSound(440, 'sine', 0.2)}
              className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <Volume2 className="w-3 h-3" /> {t('testSound')}
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {[
            { id: 'hyperfocusGuard', label: t('hyperfocusGuard'), desc: t('hyperfocusGuardDesc') },
            { id: 'sounds', label: t('sounds'), desc: t('soundsDesc') },
            { id: 'confetti', label: t('confetti'), desc: t('confettiDesc') }
          ].map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 border border-border-main rounded-2xl bg-hover/30">
              <div>
                <div className="text-sm font-bold text-text-main">{s.label}</div>
                <div className="text-[10px] text-text-muted">{s.desc}</div>
              </div>
              <button 
                onClick={() => {
                  toggle(s.id);
                  if (s.id === 'sounds' && !state.settings.sounds) {
                    // Just about to turn on sounds, play a test sound
                    setTimeout(() => playSound(660, 'sine', 0.1), 100);
                  }
                }}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative cursor-pointer",
                  state.settings[s.id] ? "bg-primary shadow-[0_0_10px_rgba(155,142,196,0.5)]" : "bg-border-main"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                  state.settings[s.id] ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">{t('dataManagement')}</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <button 
            onClick={exportData} 
            className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-[#e8e0f0] hover:border-primary-light hover:bg-[#fcfaff] transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-main">{t('export')}</div>
              <p className="text-[10px] text-text-muted leading-relaxed">{t('exportDesc')}</p>
            </div>
          </button>

          <label className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-[#e8e0f0] hover:border-primary-light hover:bg-[#fcfaff] transition-all group text-left cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-secondary-light flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-main">{t('import')}</div>
              <p className="text-[10px] text-text-muted leading-relaxed">{t('importDesc')}</p>
            </div>
            <input type="file" className="hidden" accept=".json" onChange={importData} />
          </label>
        </div>
      </div>

      <div className="card border-danger-light bg-danger-light/5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-danger" />
          <h3 className="font-display font-bold text-danger">{t('dangerZone')}</h3>
        </div>
        
        <p className="text-xs text-text-secondary mb-6 leading-relaxed">
          {t('dangerZoneDesc')}
        </p>

        <button 
          disabled={isResetting}
          onClick={() => setShowConfirmModal(true)}
          className={cn(
            "w-full btn border-2 font-bold text-xs py-4 transition-all active:scale-95 flex items-center justify-center gap-2",
            isResetting 
              ? "bg-danger text-white border-danger animate-pulse border-none" 
              : "border-danger/40 text-danger hover:bg-danger hover:text-white"
          )}
        >
          {isResetting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('deletingDb')}
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              {t('deleteAll')}
            </>
          )}
        </button>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isResetting && setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border-main rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-danger" />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4 text-danger">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">{t('resetConfirmTitle')}</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-8">
                  {t('resetConfirmDesc')}
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    disabled={isResetting}
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 bg-hover/50 hover:bg-hover text-text-main font-bold text-xs rounded-xl transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    disabled={isResetting}
                    onClick={() => {
                      setIsResetting(true);
                      if (state.settings.sounds) playSound(150, 'square', 0.3);
                      
                      if (resetStorage) {
                        setTimeout(() => {
                          resetStorage();
                        }, 1800);
                      }
                    }}
                    className={cn(
                      "flex-[1.5] py-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2",
                      isResetting 
                        ? "bg-danger text-white animate-pulse" 
                        : "bg-danger text-white hover:bg-danger-dark shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    )}
                  >
                    {isResetting ? t('deleting') : t('confirmDelete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CycleSyncView = ({ state, setState, t }: any) => {
  const updateCycle = (date: string) => {
    setState((prev: any) => ({ ...prev, cycleStartDate: date }));
  };

  const getPhase = () => {
    if (!state.cycleStartDate) return null;
    const start = new Date(state.cycleStartDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) % 28;
    
    if (diff <= 5) return { name: t('menstrualPhase'), emoji: '🩸', color: 'text-danger', desc: t('menstrualDesc') };
    if (diff <= 14) return { name: t('follicularPhase'), emoji: '🌱', color: 'text-accent', desc: t('follicularDesc') };
    if (diff <= 17) return { name: t('ovulationPhase'), emoji: '✨', color: 'text-warning', desc: t('ovulationDesc') };
    return { name: t('lutealPhase'), emoji: '🔮', color: 'text-primary', desc: t('lutealDesc') };
  };

  const phase = getPhase();

  return (
    <div className="space-y-6">
      <div className="card">
        <label className="text-xs font-bold text-text-muted uppercase block mb-2">{t('lastCycleDate')}</label>
        <input 
          type="date" 
          value={state.cycleStartDate}
          onChange={e => updateCycle(e.target.value)}
          className="w-full bg-hover border-none rounded-xl px-4 py-2 text-sm font-medium outline-none mb-6 text-text-main"
        />

        {phase && (
          <div className="text-center p-6 bg-primary/5 rounded-2xl border border-primary-light/30">
            <div className="text-5xl mb-4">{phase.emoji}</div>
            <h3 className={cn("font-display font-bold text-xl mb-2", phase.color)}>{t('phase')} {phase.name}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {phase.desc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SleepView = ({ state, setState, t }: any) => {
  const [ritualState, setRitualState] = useState(new Array(4).fill(false));

  const toggleRitual = (idx: number) => {
    const next = [...ritualState];
    next[idx] = !next[idx];
    setRitualState(next);
    if (next[idx] && state.settings.sounds) playSound(523, 'sine', 0.05);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" /> {t('sleepTrackerTitle')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase">{t('bedtimeLabel')}</label>
            <input 
              type="time" 
              value={state.sleepBedtime}
              onChange={e => setState((p: any) => ({ ...p, sleepBedtime: e.target.value }))}
              className="w-full bg-hover border-none rounded-xl px-3 py-2 text-sm mt-1 outline-none text-text-main" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase">{t('waketimeLabel')}</label>
            <input 
              type="time" 
              value={state.sleepWaketime}
              onChange={e => setState((p: any) => ({ ...p, sleepWaketime: e.target.value }))}
              className="w-full bg-hover border-none rounded-xl px-3 py-2 text-sm mt-1 outline-none text-text-main" 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-4">{t('sleepRitualTitle')}</h3>
        <div className="space-y-2">
          {[
            { icon: '📱', text: t('sleepStep1') },
            { icon: '👗', text: t('sleepStep2') },
            { icon: '🧠', text: t('sleepStep3') },
            { icon: '📖', text: t('sleepStep4') }
          ].map((step, i) => (
            <div 
              key={i} 
              onClick={() => toggleRitual(i)}
              className={cn(
                "flex items-center gap-3 p-3 bg-hover/50 rounded-xl border border-border-main cursor-pointer transition-all",
                ritualState[i] && "bg-accent-light/20 border-accent/40 opacity-80"
              )}
            >
              <span className="text-xl">{step.icon}</span>
              <span className={cn("text-xs font-medium text-text-main", ritualState[i] && "line-through text-text-muted")}>{step.text}</span>
              <div className={cn(
                "ml-auto w-5 h-5 border-2 border-border-main rounded-lg flex items-center justify-center",
                ritualState[i] && "bg-accent border-accent text-white"
              )}>
                {ritualState[i] && <CheckCircle2 className="w-3 h-3" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BodyDoubleView = ({ state, setState, t }: any) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showOverwhelm, setShowOverwhelm] = useState(false);
  const [currentMessageIdx, setCurrentMessageIdx] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const messages = t('bodyDoubleMessages') as unknown as string[];

  useEffect(() => {
    let interval: any;
    if (isActive && !showOverwhelm && isStarted) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        if (seconds > 0 && seconds % 45 === 0) {
          setCurrentMessageIdx(prev => (prev + 1) % messages.length);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, showOverwhelm, seconds, isStarted]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setIsActive(false);
    setIsStarted(false);
    setSeconds(0);
    setShowOverwhelm(false);
    setState((prev: any) => ({ ...prev, bodyDoubleIntention: '' }));
  };

  if (!isStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-xl mx-auto p-12 text-center"
      >
        <div className="w-20 h-20 bg-linear-to-br from-primary-light to-secondary-light rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-[0_10px_25px_-5px_rgba(118,74,188,0.3)]">
          👩‍💻
        </div>
        <h2 className="text-2xl font-display font-bold mb-4 text-text-main">{t('bodyDoubleTitle')}</h2>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">
          {t('bodyDoubleDesc')}
        </p>
        
        <div className="relative mb-8 group">
          <input 
            autoFocus
            type="text"
            placeholder={t('bodyDoublePlaceholder')}
            value={state.bodyDoubleIntention || ''}
            onChange={(e) => setState((prev: any) => ({ ...prev, bodyDoubleIntention: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && state.bodyDoubleIntention && (setIsStarted(true), setIsActive(true))}
            className="w-full bg-hover border-b-2 border-primary-light/50 px-4 py-5 text-center text-xl font-medium outline-none focus:border-primary transition-all rounded-t-xl placeholder:text-text-muted/30 text-text-main"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500" />
        </div>

        <div className="space-y-4">
          <button 
            disabled={!state.bodyDoubleIntention}
            onClick={() => { setIsStarted(true); setIsActive(true); }}
            className="btn btn-primary btn-lg w-full disabled:opacity-30 disabled:grayscale transition-all shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3 py-4"
          >
            <Play className="w-5 h-5 fill-current" />
            {t('bodyDoubleStart')}
          </button>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{t('bodyDoubleEnterToStart')}</p>
        </div>
      </motion.div>
    );
  }

  if (showOverwhelm) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md mx-auto p-10 text-center"
      >
        <div className="text-5xl mb-6">🍃</div>
        <h3 className="text-xl font-display font-bold mb-4">{t('bodyDoublePauseTitle')}</h3>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          {t('bodyDoublePauseDesc')}
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => setShowOverwhelm(false)}
            className="btn btn-primary w-full"
          >
            {t('bodyDoublePauseBack')}
          </button>
          <button 
            onClick={resetSession}
            className="btn btn-secondary w-full"
          >
            {t('bodyDoublePauseEnd')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card text-center p-12 relative overflow-hidden">
        {/* Focus Aura Background */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
                className="w-24 h-24 bg-card border-2 border-primary-light rounded-full flex items-center justify-center text-5xl shadow-xl z-20 relative"
              >
                👩‍💻
              </motion.div>
              {/* Breathing Circle */}
              <motion.div 
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary-light rounded-full -z-10"
              />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-text-main mb-2">{t('bodyDoublePresenceTitle')}</h2>
              <p className="text-accent font-bold text-sm bg-accent-light/20 px-4 py-1 rounded-full border border-accent/20 inline-block mb-4">
                {t('bodyDoubleFocus').replace('{t}', state.bodyDoubleIntention)}
              </p>
              
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentMessageIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-text-secondary text-base italic"
                >
                  "{messages[currentMessageIdx]}"
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
              <div className="flex flex-col items-center w-full">
                <div className="text-3xl font-display font-bold text-primary mb-2 tabular-nums">
                  {formatTime(seconds)}
                </div>
                <div className="w-full h-2 bg-hover rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-linear-to-r from-primary to-accent"
                    animate={{ width: `${Math.min((seconds / 300) * 100, 100)}%` }} // 5 min milestones
                  />
                </div>
                <div className="flex justify-between w-full mt-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  <span>{t('start')}</span>
                  <span>{t('milestone')}: 5 min</span>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "flex-1 btn btn-lg transition-all flex items-center justify-center gap-2",
                    isActive ? "btn-secondary" : "btn-primary"
                  )}
                >
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                  {isActive ? t('pause') : t('continue')}
                </button>
                <button 
                  onClick={() => setShowOverwhelm(true)}
                  className="btn btn-secondary border-danger-light text-danger hover:bg-danger hover:text-white"
                >
                   {t('bodyDoubleBlockage')}
                </button>
              </div>

              <button 
                onClick={resetSession}
                className="text-xs font-bold text-text-muted hover:text-text-main transition-colors"
              >
                {t('bodyDoubleEndSession')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-6 bg-card/50 border-primary-light flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <div className="text-sm font-bold text-text-main">{t('bodyDoubleMirrorMode')}</div>
            <p className="text-[10px] text-text-secondary">{t('bodyDoubleMirrorModeDesc')}</p>
          </div>
        </div>
        <div className="card p-6 bg-card/50 border-accent-light flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-2xl">
            👂
          </div>
          <div>
            <div className="text-sm font-bold text-text-main">{t('bodyDoubleNoJudgment')}</div>
            <p className="text-[10px] text-text-secondary">{t('bodyDoubleNoJudgmentDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImpulseCheckerView = ({ t }: { t: (key: string) => string }) => {
  const [checks, setChecks] = useState(new Array(4).fill(false));
  const [evaluated, setEvaluated] = useState(false);

  const toggleCheck = (idx: number) => {
    const next = [...checks];
    next[idx] = !next[idx];
    setChecks(next);
  };

  const getResult = () => {
    const score = checks.filter(c => c).length;
    if (score >= 3) return { text: t('impulseResultReasonable'), color: "text-accent" };
    if (score >= 2) return { text: t('impulseResultWait'), color: "text-warning" };
    return { text: t('impulseResultStop'), color: "text-danger" };
  };

  return (
    <div className="card bg-warning-light border-warning p-8 text-center">
      <div className="text-5xl mb-4">🤔</div>
      <h3 className="font-display font-bold text-xl mb-6">{t('impulseQuestionTitle')}</h3>
      <div className="space-y-4 text-left max-w-xs mx-auto mb-8">
        {[
          t('impulseQ1'),
          t('impulseQ2'),
          t('impulseQ3'),
          t('impulseQ4')
        ].map((q, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={checks[i]} 
              onChange={() => toggleCheck(i)}
              className="w-5 h-5 accent-warning rounded"
            />
            <span className="text-xs font-medium">{q}</span>
          </label>
        ))}
      </div>

      {evaluated && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-8 p-4 bg-white rounded-xl border border-warning shadow-sm font-bold text-sm", getResult().color)}
        >
          {getResult().text}
        </motion.div>
      )}

      <button 
        onClick={() => setEvaluated(true)}
        className="btn btn-primary w-full max-w-xs"
      >
        {evaluated ? t('impulseReevaluate') : t('impulseEvaluate')}
      </button>
    </div>
  );
};

const TravelKitView = ({ state, setState, t }: any) => {
  const [text, setText] = useState('');

  const addItem = () => {
    if(!text.trim()) return;
    setState((prev: any) => ({
      ...prev,
      travelItems: [...prev.travelItems, { id: Date.now().toString(), text, category: 'essentials', checked: false }]
    }));
    setText('');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex gap-2 mb-6">
          <input 
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('travelPlaceholder')}
            className="flex-1 bg-hover border border-border-main rounded-xl px-4 py-2 text-sm font-medium outline-none text-text-main focus:border-primary-light transition-all"
          />
          <button onClick={addItem} className="btn btn-primary btn-sm">{t('add')}</button>
        </div>

        <div className="space-y-2">
          {state.travelItems.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border border-border-main rounded-xl bg-card/30">
              <button 
                onClick={() => {
                  const newItems = state.travelItems.map((i: any) => i.id === item.id ? { ...i, checked: !i.checked } : i);
                  setState((prev: any) => ({ ...prev, travelItems: newItems }));
                }}
                className={cn(
                  "w-5 h-5 border-2 rounded transition-all",
                  item.checked ? "bg-accent border-accent" : "border-border-main bg-card"
                )}
              />
              <span className={cn("text-xs font-medium text-text-main", item.checked && "line-through opacity-50")}>{item.text}</span>
              <button 
                onClick={() => setState((prev: any) => ({ ...prev, travelItems: prev.travelItems.filter((i: any) => i.id !== item.id) }))}
                className="ml-auto p-1 text-text-muted hover:text-danger"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function renderView(state: any, setState: any, navigateTo: any, resetStorage: any, t: (key: string) => string) {
  switch (state.currentView) {
    case 'dashboard': return <DashboardView state={state} setState={setState} navigateTo={navigateTo} t={t} />;
    case 'morning': return <MorningLaunchView state={state} setState={setState} navigateTo={navigateTo} t={t} />;
    case 'tasks': return <TasksView state={state} setState={setState} t={t} />;
    case 'timer': return <TimerView state={state} setState={setState} t={t} />;
    case 'braindump': return <BrainDumpView state={state} setState={setState} navigateTo={navigateTo} t={t} />;
    case 'energy': return <EnergyTrackerView state={state} setState={setState} t={t} />;
    case 'dopamine': return <DopamineMenuView state={state} setState={setState} t={t} />;
    case 'habits': return <HabitTrackerView state={state} setState={setState} t={t} />;
    case 'meds': return <MedsView state={state} setState={setState} t={t} />;
    case 'wins': return <WinsJournalView state={state} setState={setState} t={t} />;
    case 'rsd': return <RsdShieldView state={state} setState={setState} t={t} />;
    case 'settings': return <SettingsView state={state} setState={setState} resetStorage={resetStorage} t={t} />;
    case 'cycle': return <CycleSyncView state={state} setState={setState} t={t} />;
    case 'sleep': return <SleepView state={state} setState={setState} t={t} />;
    case 'bodydouble': return <BodyDoubleView state={state} setState={setState} t={t} />;
    case 'impulse': return <ImpulseCheckerView t={t} />;
    case 'travel': return <TravelKitView state={state} setState={setState} t={t} />;
    case 'rescue': return <OverwhelmRescueView state={state} t={t} />;
    case 'guide': return <GuideView state={state} t={t} />;
    default: return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <AlertCircle className="w-16 h-16 text-text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-display font-bold text-text-main">{t('featureUnavailable')}</h2>
        <p className="text-text-secondary">{t('inDevelopment')}</p>
        <button 
          onClick={() => navigateTo('dashboard')}
          className="mt-6 btn btn-primary"
        >
          {t('backToDashboard')}
        </button>
      </div>
    );
  }
}

// --- View Components ---

const GuideView = ({ state, t }: any) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto py-4">
      <div className="card bg-linear-to-br from-primary/10 to-accent/10 border-primary/20">
        <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          {t('guide_workflow_title')}
        </h3>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-sm">
                {num}
              </div>
              <div>
                <h4 className="font-bold text-text-main mb-1">{t(`guide_tip${num}_title`)}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{t(`guide_tip${num}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-warning" />
          {t('guide_adhd_tips_title')}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="p-4 bg-hover/50 rounded-2xl border border-border-main hover:border-primary-light transition-all">
              <p className="text-xs font-medium text-text-main leading-relaxed">
                {t(`guide_adhd_tip${num}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ state, setState, navigateTo, t }: any) => {
  const today = new Date().toDateString();
  const todayTasks = state.tasks.filter((t: any) => new Date(t.created).toDateString() === today);
  const completedToday = todayTasks.filter((t: any) => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('statTasksToday'), value: todayTasks.length, icon: Target },
          { label: t('statCompleted'), value: completedToday, icon: CheckCircle2 },
          { label: t('statFocusMinutes'), value: state.timerState.totalFocusMinutes, icon: Timer },
          { label: t('statWinsToday'), value: state.wins.filter((w: any) => new Date(w.date).toDateString() === today).length, icon: Trophy }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card border border-border-main p-4 rounded-xl text-center">
            <stat.icon className="w-5 h-5 mx-auto mb-2 text-text-muted" />
            <div className="text-2xl font-display font-bold text-text-main">{stat.value}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {state.dailyPriority && (
        <div className="bg-linear-to-r from-primary-light/30 to-secondary-light/30 rounded-2xl p-6 text-center border border-primary-light/20 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2">🎯 {t('dailyPriorityTitle')}</div>
          <div className="text-xl font-display font-bold text-text-main">{state.dailyPriority}</div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> {t('taskPending')}
            </h3>
            <button onClick={() => navigateTo('tasks')} className="text-xs font-semibold text-primary">{t('taskAll')}</button>
          </div>
          <div className="space-y-2">
            {state.tasks.filter((t: any) => !t.completed).slice(0, 5).map((task: any) => (
              <div 
                key={task.id} 
                className="flex items-center gap-3 p-3 border border-border-main rounded-xl hover:bg-hover cursor-pointer transition-colors"
                onClick={() => {
                  const newTasks = state.tasks.map((t: any) => t.id === task.id ? { ...t, completed: true } : t);
                  setState((prev: any) => ({ ...prev, tasks: newTasks }));
                }}
              >
                <div className="w-5 h-5 border-2 border-border-main rounded-full" />
                <span className="text-sm font-medium">{task.text}</span>
              </div>
            ))}
          {state.tasks.filter((t: any) => !t.completed).length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs uppercase font-bold tracking-widest">{t('noTasksClear')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" /> {t('winsRecent')}
            </h3>
            <button onClick={() => navigateTo('wins')} className="text-xs font-semibold text-primary">{t('winsJournal')}</button>
          </div>
          <div className="space-y-2">
            {state.wins.slice(0, 3).map((win: any) => (
              <div key={win.id} className="flex gap-3 p-3 bg-card border border-border-main rounded-xl border-l-4 border-l-accent shadow-xs group cursor-pointer hover:bg-hover transition-colors" onClick={() => navigateTo('wins')}>
                <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
                <div>
                  <div className="text-xs font-semibold text-text-main">{win.text}</div>
                  <div className="text-[10px] text-text-secondary font-medium">{new Date(win.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {state.wins.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs uppercase font-bold tracking-widest">{t('winsEmpty')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksView = ({ state, setState, t }: any) => {
  const [filter, setFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [priority, setPriority] = useState<Priority>('p3');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: Task = {
      id: 'task_' + Date.now(),
      text: newTaskText,
      priority,
      dueDate: '',
      completed: false,
      created: new Date().toISOString(),
      subtasks: []
    };
    setState((prev: any) => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setNewTaskText('');
    setIsAdding(false);
  };

  const helpBreakdown = async (taskId: string, title: string) => {
    setAiLoading(taskId);
    const steps = await breakdownTask(title, state.settings.language);
    if (steps.length > 0) {
      const subtasks = steps.map(s => ({
        id: 'sub_' + Math.random().toString(36).substr(2, 9),
        text: s,
        completed: false
      }));
      setState((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((tk: any) => 
          tk.id === taskId ? { ...tk, subtasks: [...tk.subtasks, ...subtasks] } : tk
        )
      }));
    }
    setAiLoading(null);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setState((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((tk: any) => 
        tk.id === taskId ? {
          ...tk,
          subtasks: tk.subtasks.map((st: any) => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        } : tk
      )
    }));
  };

  const filteredTasks = state.tasks.filter((tk: any) => {
    if (filter === 'pending') return !tk.completed;
    if (filter === 'completed') return tk.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 bg-card p-1 rounded-xl border border-border-main">
          {['all', 'pending', 'completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                filter === f ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-hover"
              )}
            >
              {f === 'all' ? t('taskAll') : f === 'pending' ? t('taskPending') : t('taskCompleted')}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn btn-primary btn-sm flex gap-2"
        >
          <Plus className="w-4 h-4" /> {t('newTask')}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card bg-card border-2 border-primary-light/50">
              <div className="space-y-4">
                <input 
                  autoFocus
                  placeholder={t('newTaskPlaceholder')} 
                  className="w-full bg-transparent border-none text-lg font-display font-medium outline-none placeholder:text-text-muted text-text-main"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['p1', 'p2', 'p3'] as Priority[]).map(p => (
                      <button 
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          "text-[10px] font-bold px-3 py-1 rounded-full border transition-all",
                          priority === p 
                            ? (p === 'p1' ? "bg-danger text-white border-danger" : p === 'p2' ? "bg-warning text-white border-warning" : "bg-accent text-white border-accent")
                            : "border-border-main text-text-secondary"
                        )}
                      >
                        {p === 'p1' ? t('taskPriority_p1') : p === 'p2' ? t('taskPriority_p2') : t('taskPriority_p3')}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsAdding(false)} className="btn text-sm">{t('cancel')}</button>
                    <button onClick={addTask} className="btn btn-primary btn-sm">{t('add')}</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredTasks.map((task: any) => (
          <motion.div 
            layout
            key={task.id}
            className={cn(
              "flex items-center gap-4 p-4 bg-card border border-border-main rounded-2xl group transition-all",
              task.completed && "opacity-60"
            )}
          >
            <button 
              onClick={() => {
                const newTasks = state.tasks.map((t: any) => t.id === task.id ? { ...t, completed: !t.completed } : t);
                setState((prev: any) => ({ ...prev, tasks: newTasks }));
              }}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                task.completed ? "bg-accent border-accent text-white" : "border-border-main hover:border-primary"
              )}
            >
              {task.completed && <CheckCircle2 className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <div className={cn("text-sm font-medium text-text-main", task.completed && "line-through text-text-muted")}>
                {task.text}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-[9px] uppercase font-bold tracking-wider",
                  task.priority === 'p1' ? "text-danger" : task.priority === 'p2' ? "text-warning" : "text-accent"
                )}>
                  {task.priority === 'p1' ? t('taskPriority_p1') : task.priority === 'p2' ? t('taskPriority_p2') : t('taskPriority_p3')}
                </span>
                {!task.completed && (
                  <button 
                    onClick={() => helpBreakdown(task.id, task.text)}
                    disabled={aiLoading === task.id}
                    className="flex items-center gap-1 text-[9px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all ml-2"
                  >
                    {aiLoading === task.id ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5" />
                    )}
                    {aiLoading === task.id ? t('breakingDown') : t('simplify')}
                  </button>
                )}
              </div>
              
              {task.subtasks.length > 0 && (
                <div className="mt-4 space-y-2 pl-2 border-l-2 border-border-main ml-2">
                  {task.subtasks.map((st: any) => (
                    <div key={st.id} className="flex items-center gap-2 group/sub">
                      <button 
                        onClick={() => toggleSubtask(task.id, st.id)}
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          st.completed ? "bg-primary border-primary text-white" : "border-border-main group-hover/sub:border-primary"
                        )}
                      >
                        {st.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </button>
                      <span className={cn("text-xs transition-all", st.completed ? "text-text-muted line-through" : "text-text-secondary")}>
                        {st.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                const newTasks = state.tasks.filter((t: any) => t.id !== task.id);
                setState((prev: any) => ({ ...prev, tasks: newTasks }));
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-danger hover:bg-danger-light rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-display font-medium uppercase tracking-widest text-xs">{t('taskNoTasks')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TimerView = ({ state, setState, t }: any) => {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning && state.timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setState((prev: any) => ({
          ...prev,
          timerState: { ...prev.timerState, timeLeft: prev.timerState.timeLeft - 1 }
        }));
      }, 1000);
    } else if (state.timerState.timeLeft === 0) {
      setIsRunning(false);
      // Bell/Completion logic here
    }
    return () => clearInterval(interval);
  }, [isRunning, state.timerState.timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (state.timerState.totalTime - state.timerState.timeLeft) / state.timerState.totalTime;

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card text-center p-12 relative overflow-hidden">
        {/* Progress background effect */}
        <div 
          className="absolute inset-0 bg-primary/5 transition-all duration-1000" 
          style={{ height: `${progress * 100}%`, top: 'auto' }}
        />
        
        <div className="relative z-10">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-2">{t('focusSessionTitle')}</div>
          <div className="text-7xl font-display font-bold text-text-main tracking-tighter mb-8 transition-all duration-300">
            {formatTime(state.timerState.timeLeft)}
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => {
                setState((prev: any) => ({
                  ...prev,
                  timerState: { ...prev.timerState, timeLeft: prev.timerState.totalTime }
                }));
                setIsRunning(false);
              }}
              className="w-14 h-14 bg-card border border-border-main rounded-full flex items-center justify-center hover:bg-hover transition-colors"
            >
              <RotateCcw className="w-6 h-6 text-text-secondary" />
            </button>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button className="w-14 h-14 bg-card border border-border-main rounded-full flex items-center justify-center hover:bg-hover transition-colors">
              <Volume2 className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          <div className="flex gap-2 justify-center mt-12">
            {[15, 25, 45, 60].map(mins => (
              <button 
                key={mins}
                onClick={() => {
                  setState((prev: any) => ({
                    ...prev,
                    timerState: { ...prev.timerState, totalTime: mins * 60, timeLeft: mins * 60 }
                  }));
                  setIsRunning(false);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                  state.timerState.totalTime === mins * 60 
                    ? "bg-primary border-primary text-white ring-2 ring-primary-light" 
                    : "bg-card border-border-main text-text-secondary hover:border-primary-light"
                )}
              >
                {mins}{t('minutesShort')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BrainDumpView = ({ state, setState, navigateTo, t }: any) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('idea');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const addDump = () => {
    if (!text.trim()) return;
    const dump: any = {
      id: 'dump_' + Date.now(),
      text,
      category,
      created: new Date().toISOString()
    };
    setState((prev: any) => ({ ...prev, brainDumps: [dump, ...prev.brainDumps] }));
    setText('');
  };

  const handleSmartExtract = async () => {
    if (!text.trim()) return;
    setAiAnalyzing(true);
    const result = await summarizeBrainDump(text, state.settings.language);
    if (result) {
      if (result.tasks && result.tasks.length > 0) {
        const newTasks = result.tasks.map((tText: string) => ({
          id: 'task_' + Math.random().toString(36).substr(2, 9),
          text: tText,
          priority: 'p3',
          dueDate: '',
          completed: false,
          created: new Date().toISOString(),
          subtasks: []
        }));
        setState((prev: any) => ({ ...prev, tasks: [...newTasks, ...prev.tasks] }));
      }
      
      const dump: any = {
        id: 'dump_' + Date.now(),
        text: `${result.summary} (extracted from dump)`,
        category: result.category || 'idea',
        created: new Date().toISOString()
      };
      setState((prev: any) => ({ ...prev, brainDumps: [dump, ...prev.brainDumps] }));
      setText('');
      navigateTo('tasks');
    }
    setAiAnalyzing(false);
  };

  const convertToTask = () => {
    if (!text.trim()) return;
    const task: Task = {
      id: 'task_' + Date.now(),
      text,
      priority: 'p3',
      dueDate: '',
      completed: false,
      created: new Date().toISOString(),
      subtasks: []
    };
    setState((prev: any) => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setText('');
    navigateTo('tasks');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <textarea 
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('braindumpPlaceholder')}
          className="w-full bg-transparent border-none text-lg font-medium outline-none placeholder:text-text-muted text-text-main min-h-[150px] resize-none"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border-main">
          <select 
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="bg-hover border border-border-main rounded-xl px-4 py-2 text-xs font-semibold outline-none text-text-main"
          >
            <option value="trabajo">{t('braindumpCategory_trabajo')}</option>
            <option value="personal">{t('braindumpCategory_personal')}</option>
            <option value="urgente">{t('braindumpCategory_urgente')}</option>
            <option value="idea">{t('braindumpCategory_idea')}</option>
            <option value="compra">{t('braindumpCategory_compra')}</option>
          </select>
          <div className="flex-1" />
          <button 
            onClick={handleSmartExtract} 
            disabled={aiAnalyzing || !text.trim()}
            className="btn btn-secondary text-sm flex gap-2 items-center"
          >
            {aiAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {aiAnalyzing ? t('aiThinking') : t('braindumpSmartExtract')}
          </button>
          <button onClick={convertToTask} className="btn btn-secondary text-sm">{t('convertToTask')}</button>
          <button onClick={addDump} className="btn btn-primary text-sm px-8">{t('save')}</button>
        </div>
      </div>

      <div className="space-y-3">
        {state.brainDumps.map((dump: any) => (
          <div key={dump.id} className="card p-4 hover:border-primary-light border-dashed bg-hover/10 transition-all">
            <p className="text-sm leading-relaxed mb-3 text-text-main font-medium">{dump.text}</p>
            <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <span className={cn(
                "px-2 py-0.5 rounded-full border",
                dump.category === 'urgente' ? "text-danger border-danger-light/30" : "text-primary border-primary-light/30"
              )}>
                {t(`cat_${dump.category}`) || dump.category}
              </span>
              <span>{new Date(dump.created).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

