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
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useAppState } from './hooks/useAppState';
import { View, Task, Priority, Category, INITIAL_STATE, Win } from './types';
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
        : "text-[#7a7089] hover:bg-[#f5f0eb] hover:text-[#3d3450]"
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
  const [state, setState] = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = state.settings.theme;
  }, [state.settings.theme]);

  const navigateTo = (view: View) => {
    setState(prev => ({ ...prev, currentView: view }));
    setSidebarOpen(false);
  };

  const getActiveTasksCount = () => state.tasks.filter(t => !t.completed).length;

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
        "fixed inset-y-0 left-0 w-64 bg-white border-r border-[#e8e0f0] p-5 z-50 transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <div className="font-display font-bold text-[#3d3450]">NeuroFlow OS</div>
            <div className="text-[10px] text-[#a9a0b5] font-normal uppercase tracking-wider">ADHD Command Centre</div>
          </div>
        </div>

        <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 scrollbar-thin">
          <div>
            <div className="text-[10px] font-bold text-[#a9a0b5] uppercase tracking-widest px-3 mb-2">Principal</div>
            <ul className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Panel General" active={state.currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
              <SidebarItem icon={Rocket} label="Inicio Matutino" active={state.currentView === 'morning'} onClick={() => navigateTo('morning')} />
              <SidebarItem icon={Target} label="Tareas" active={state.currentView === 'tasks'} onClick={() => navigateTo('tasks')} badge={getActiveTasksCount()} />
              <SidebarItem icon={Timer} label="Reloj de Enfoque" active={state.currentView === 'timer'} onClick={() => navigateTo('timer')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-[#a9a0b5] uppercase tracking-widest px-3 mb-2">Cerebro</div>
            <ul className="space-y-1">
              <SidebarItem icon={Brain} label="Vaciado Mental" active={state.currentView === 'braindump'} onClick={() => navigateTo('braindump')} />
              <SidebarItem icon={Zap} label="Rastreador de Energía" active={state.currentView === 'energy'} onClick={() => navigateTo('energy')} />
              <SidebarItem icon={XOctagon} label="Filtro de Impulsos" active={state.currentView === 'impulse'} onClick={() => navigateTo('impulse')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-[#a9a0b5] uppercase tracking-widest px-3 mb-2">Bienestar</div>
            <ul className="space-y-1">
              <SidebarItem icon={Gamepad2} label="Menú de Dopamina" active={state.currentView === 'dopamine'} onClick={() => navigateTo('dopamine')} />
              <SidebarItem icon={RefreshCw} label="Hábitos" active={state.currentView === 'habits'} onClick={() => navigateTo('habits')} />
              <SidebarItem icon={Moon} label="Ciclo Hormonal" active={state.currentView === 'cycle'} onClick={() => navigateTo('cycle')} />
              <SidebarItem icon={Pill} label="Medicación y Salud" active={state.currentView === 'meds'} onClick={() => navigateTo('meds')} />
              <SidebarItem icon={CloudMoon} label="Sueño" active={state.currentView === 'sleep'} onClick={() => navigateTo('sleep')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-[#a9a0b5] uppercase tracking-widest px-3 mb-2">Rescate</div>
            <ul className="space-y-1">
              <SidebarItem icon={AlertCircle} label="Botón de Rescate" active={state.currentView === 'rescue'} onClick={() => navigateTo('rescue')} />
              <SidebarItem icon={ShieldCheck} label="Escudo RSD" active={state.currentView === 'rsd'} onClick={() => navigateTo('rsd')} />
              <SidebarItem icon={Users} label="Socio de Trabajo" active={state.currentView === 'bodydouble'} onClick={() => navigateTo('bodydouble')} />
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold text-[#a9a0b5] uppercase tracking-widest px-3 mb-2">Más</div>
            <ul className="space-y-1">
              <SidebarItem icon={Trophy} label="Diario de Victorias" active={state.currentView === 'wins'} onClick={() => navigateTo('wins')} />
              <SidebarItem icon={Plane} label="Kit de Viaje" active={state.currentView === 'travel'} onClick={() => navigateTo('travel')} />
              <SidebarItem icon={Settings} label="Ajustes" active={state.currentView === 'settings'} onClick={() => navigateTo('settings')} />
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-[#e8e0f0]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-[#f5f0eb] rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-[#3d3450] capitalize">
                {state.currentView === 'dashboard' ? 'Vista General' : state.currentView === 'braindump' ? 'Vaciado Mental' : state.currentView === 'bodydouble' ? 'Socio de Trabajo' : state.currentView.replace(/([A-Z])/g, ' $1')}
              </h1>
              <p className="text-xs text-[#a9a0b5]">
                {getViewSubtitle(state.currentView)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div 
              className="hidden sm:flex items-center gap-3 bg-white border border-[#e8e0f0] px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#f5f0eb]"
              onClick={() => navigateTo('energy')}
            >
              <Zap className="w-4 h-4 text-warning" />
              <div className="w-16 h-1.5 bg-[#e8e0f0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-danger via-warning to-accent transition-all duration-500" 
                  style={{ width: `${state.energyToday * 10}%` }}
                />
              </div>
              <span className="text-xs font-bold">{state.energyToday}/10</span>
            </div>

            <button 
              onClick={() => navigateTo('rescue')}
              className="w-10 h-10 border border-[#e8e0f0] bg-white rounded-xl flex items-center justify-center hover:bg-[#f5f0eb] text-danger"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
            
            <button className="relative w-10 h-10 border border-[#e8e0f0] bg-white rounded-xl flex items-center justify-center hover:bg-[#f5f0eb]">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-danger border-2 border-white rounded-full" />
            </button>
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
            {renderView(state, setState, navigateTo)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function getViewSubtitle(view: View): string {
  const subtitles: Record<View, string> = {
    dashboard: 'Tu centro de operaciones diario',
    morning: 'Ritual de 5 minutos para empezar con enfoque',
    tasks: 'Gestiona tus tareas sin abrumarte',
    timer: 'Sesiones de enfoque adaptativo',
    braindump: 'Vacía tu mente al instante',
    energy: 'Mapea tu ritmo biológico',
    impulse: 'Filtro de consciencia antes de actuar',
    dopamine: 'Boosters saludables para tu ADHD brain',
    habits: 'Progreso real, no perfección',
    cycle: 'Productividad cíclica hormonal',
    meds: 'Punto de control de medicación y salud',
    sleep: 'Prepara tu descanso ideal',
    rescue: 'Botón de pausa para momentos críticos',
    rsd: 'Protección contra el ruido emocional',
    bodydouble: 'Compañía virtual para tareas difíciles',
    wins: 'Celebra cada pequeña conquista',
    travel: 'Que no se te olvide nada importante',
    settings: 'Personaliza tu entorno de NeuroFlow'
  };
  return subtitles[view] || 'Gestión neurodivergente';
}

const MorningLaunchView = ({ state, setState, navigateTo }: any) => {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(s => s + 1);

  const steps = [
    { title: 'Respira', desc: 'Toma 3 respiraciones profundas. Inhala 4s, mantén 4s, exhala 4s.', emoji: '🌬️' },
    { title: 'Medicación', desc: '¿Has tomado tu medicación hoy?', emoji: '💊' },
    { title: 'Prioridad', desc: 'Si solo pudieras hacer UNA cosa hoy, ¿qué sería?', emoji: '🎯' },
    { title: 'Ritual', desc: 'Elige tu ritual de inicio (Música, café, estiramiento)', emoji: '✨' }
  ];

  if (step >= steps.length) {
    return (
      <div className="card text-center p-12">
        <div className="text-5xl mb-6">🚀</div>
        <h2 className="text-2xl font-display font-bold mb-2">¡Todo listo!</h2>
        <p className="text-[#7a7089] mb-8">Tu día empieza con claridad. Tu prioridad: <strong>{state.dailyPriority}</strong></p>
        <button onClick={() => navigateTo('dashboard')} className="btn btn-primary btn-lg w-full">Comenzar el día</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={cn("w-full h-1.5 rounded-full transition-all duration-500", i <= step ? "bg-primary" : "bg-[#e8e0f0]")} />
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
        <p className="text-[#a9a0b5] mb-8">{steps[step].desc}</p>

        {step === 1 && (
          <div className="flex gap-4 mb-8">
            <button onClick={nextStep} className="btn flex-1 btn-primary">Sí, ya la tomé</button>
            <button onClick={nextStep} className="btn flex-1 btn-secondary">Aún no</button>
          </div>
        )}

        {step === 2 && (
          <div className="mb-8">
            <input 
              autoFocus
              className="w-full text-center text-xl font-display font-bold border-b-2 border-primary-light outline-none py-2 focus:border-primary transition-all"
              placeholder="Escribe tu prioridad..."
              value={state.dailyPriority}
              onChange={e => setState((prev: any) => ({ ...prev, dailyPriority: e.target.value }))}
            />
          </div>
        )}

        {step !== 1 && (
          <button onClick={nextStep} className="btn btn-primary btn-lg w-full">Siguiente →</button>
        )}
      </motion.div>
    </div>
  );
};

const OverwhelmRescueView = ({ state }: any) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: '🧘 Grounding 5-4-3-2-1', desc: 'Nombra: 5 cosas que ves, 4 que puedes tocar, 3 que oyes, 2 que hueles, 1 que saboreas.' },
    { title: '🌬️ Respiración Guiada', desc: 'Inhala 4s → Mantén 4s → Exhala 6s. Repite 3 veces.' },
    { title: '❄️ Congela todo', desc: 'No necesitas hacer nada AHORA. Es ok pausar todo.' },
    { title: '🎯 Micro-Win', desc: 'Haz algo absurdamente pequeño: bebe un trago de agua.' }
  ];

  const handleComplete = (i: number) => {
    setStep(i + 1);
    if (state.settings.sounds) playSound(440 + (i * 100), 'sine', 0.1);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card border-2 border-danger bg-danger-light text-center py-10">
        <AlertCircle className="w-12 h-12 mx-auto text-danger mb-4" />
        <h2 className="text-2xl font-display font-bold text-danger">Modo Rescate</h2>
        <p className="text-danger opacity-80">Sigue los pasos a tu ritmo. No hay prisa.</p>
      </div>

      {steps.map((s, i) => (
        <div key={i} className={cn(
          "card flex gap-4 items-start transition-all duration-500",
          step === i ? "border-primary ring-2 ring-primary-light scale-[1.02]" : step > i ? "border-accent bg-accent-light opacity-60" : "opacity-40"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0",
            step > i ? "bg-accent text-white" : "bg-primary text-white"
          )}>
            {step > i ? '✓' : i + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#3d3450] mb-1">{s.title}</h4>
            <p className="text-xs text-[#7a7089] mb-4">{s.desc}</p>
            {step === i && (
              <button 
                onClick={() => handleComplete(i)}
                className="btn btn-primary btn-sm"
              >
                Completado
              </button>
            )}
          </div>
        </div>
      ))}

      {step >= steps.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <p className="text-accent font-bold text-lg mb-4">💚 Lo lograste. Estás a salvo.</p>
          <button onClick={() => {
              setStep(0);
              if (state.settings.confetti) triggerConfetti();
          }} className="btn btn-secondary text-sm">Reiniciar protocolo</button>
        </motion.div>
      )}
    </div>
  );
};

const EnergyTrackerView = ({ state, setState }: any) => {
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
        <h3 className="font-display font-bold mb-6">¿Cuánta energía tienes AHORA?</h3>
        <div className="flex items-center justify-center gap-6 mb-8">
          <span className="text-2xl">😫</span>
          <input 
            type="range" 
            min="1" max="10" 
            value={state.energyToday} 
            onChange={(e) => updateEnergy(parseInt(e.target.value))}
            className="w-full max-w-xs accent-primary"
          />
          <span className="text-2xl">🚀</span>
        </div>
        <div className="text-6xl font-display font-bold text-primary mb-4">{state.energyToday}</div>
        <button onClick={logEnergy} className="btn btn-primary px-8">Registrar Energía</button>
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" /> Historial de Energía
        </h3>
        <div className="flex items-end gap-2 h-40 pt-4">
          {state.energyLogs.slice(-7).map((log: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-primary-light rounded-t-lg transition-all duration-500" 
                style={{ height: `${log.value * 10}%` }}
              />
              <span className="text-[10px] text-[#a9a0b5] font-bold">
                {new Date(log.date).toLocaleDateString([], { weekday: 'short' })}
              </span>
            </div>
          ))}
          {state.energyLogs.length === 0 && (
            <div className="w-full text-center text-[#a9a0b5] py-10 text-xs">Sin registros aún</div>
          )}
        </div>
      </div>
    </div>
  );
};

const DopamineMenuView = ({ state, setState }: any) => {
  const activities = [
    { emoji: '🧘', name: 'Estiramientos Rápidos', desc: '2 minutos de movimiento', time: '2 min' },
    { emoji: '💃', name: 'Bailar 1 Canción', desc: 'Tu canción favorita', time: '3 min' },
    { emoji: '🌬️', name: 'Respiración 4-7-8', desc: 'Calma inmediata', time: '2 min' },
    { emoji: '🎨', name: 'Doodle / Arte Libre', desc: 'Garabatea sin pensar', time: '5 min' },
    { emoji: '🚶', name: 'Caminata Corta', desc: 'Al aire libre si es posible', time: '15 min' },
    { emoji: '📦', name: 'Organizar un Cajón', desc: 'Satisfacción instantánea', time: '10 min' }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="text-sm text-[#7a7089] mb-6">¿Batería social o mental baja? Elige un booster saludable.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {activities.map((act, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 p-4 border border-[#e8e0f0] rounded-2xl hover:bg-[#fcfaff] hover:border-primary-light cursor-pointer transition-all group"
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
                <div className="text-sm font-bold">{act.name}</div>
                <div className="text-[10px] text-[#a9a0b5]">{act.desc}</div>
              </div>
              <span className="text-[10px] font-bold text-primary">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HabitTrackerView = ({ state, setState }: any) => {
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

  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex gap-2 mb-6">
          <input 
            value={newHabitEmoji}
            onChange={e => setNewHabitEmoji(e.target.value)}
            className="w-12 bg-[#f5f0eb] border-none rounded-xl text-center text-xl outline-none"
            maxLength={2}
          />
          <input 
            value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)}
            placeholder="Nuevo hábito..."
            className="flex-1 bg-[#f5f0eb] border-none rounded-xl px-4 text-sm font-medium outline-none"
          />
          <button onClick={addHabit} className="btn btn-primary btn-sm">Añadir</button>
        </div>

        <div className="space-y-4">
          {state.habits.map((habit: any) => (
            <div key={habit.id} className="flex items-center gap-4 p-4 border border-[#e8e0f0] rounded-2xl">
              <span className="text-2xl">{habit.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold">{habit.name}</div>
                <div className="text-[10px] text-[#a9a0b5]">🔥 Racha: {habit.streak} días</div>
              </div>
              <div className="flex gap-1.5">
                {days.map((d, i) => (
                  <button 
                    key={i}
                    onClick={() => toggleDay(habit.id, i)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-[10px] font-bold border transition-all",
                      habit.days[i] ? "bg-accent border-accent text-white" : "border-[#e8e0f0] text-[#a9a0b5] hover:border-primary-light"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setState((prev: any) => ({ ...prev, habits: prev.habits.filter((h: any) => h.id !== habit.id) }))}
                className="p-2 text-[#a9a0b5] hover:text-danger"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {state.habits.length === 0 && (
            <div className="text-center py-10 text-[#a9a0b5]">
              <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs">Sin hábitos aún. Empieza con algo pequeño.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MedsView = ({ state, setState }: any) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');

  const addMed = () => {
    if (!name.trim()) return;
    const med = {
      id: 'med_' + Date.now(),
      name,
      dosage,
      frequency: 'Una vez al día',
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
            placeholder="Nombre (ej: Ritalin)"
            className="bg-[#f5f0eb] border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
          />
          <input 
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="Dosis (ej: 20mg)"
            className="bg-[#f5f0eb] border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
          />
          <button onClick={addMed} className="col-span-2 btn btn-primary btn-sm">Añadir Medicación</button>
        </div>

        <div className="space-y-3">
          {state.meds.map((med: any) => (
            <div key={med.id} className="flex items-center justify-between p-4 border border-[#e8e0f0] rounded-2xl">
              <div>
                <div className="text-sm font-bold">{med.name}</div>
                <div className="text-[10px] text-[#a9a0b5]">{med.dosage} - {med.frequency}</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleMed(med.id)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                    med.log[today] ? "bg-accent border-accent text-white" : "border-[#e8e0f0] text-[#a9a0b5]"
                  )}
                >
                  {med.log[today] ? <CheckCircle2 className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setState((prev: any) => ({ ...prev, meds: prev.meds.filter((m: any) => m.id !== med.id) }))}
                  className="p-2 text-[#a9a0b5] hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {state.meds.length === 0 && (
            <div className="text-center py-10 text-[#a9a0b5]">
              <Pill className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs">No hay medicamentos registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WinsJournalView = ({ state, setState }: any) => {
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
          placeholder="¿Qué lograste hoy? ¡Todo cuenta!"
          className="w-full bg-[#f5f0eb] border-none rounded-2xl px-4 py-3 text-sm font-medium outline-none min-h-[100px] mb-4"
        />
        <button onClick={addWin} className="btn btn-primary w-full">Registrar Victoria ✨</button>
      </div>

      <div className="space-y-3">
        {state.wins.map((win: any) => (
          <div key={win.id} className="flex gap-4 p-4 bg-white border border-[#e8e0f0] rounded-2xl">
            <div className="text-2xl pt-1">🏆</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{win.text}</div>
              <div className="text-[10px] text-[#a9a0b5] uppercase mt-1">
                {new Date(win.date).toLocaleDateString()} • {new Date(win.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button 
                onClick={() => setState((prev: any) => ({ ...prev, wins: prev.wins.filter((w: any) => w.id !== win.id) }))}
                className="p-1 text-[#a9a0b5] hover:text-danger"
              >
                <Trash2 className="w-4 h-4" />
              </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const RsdShieldView = ({ state }: any) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  
  const affirmations: Record<string, string[]> = {
    'Rechazo': [
      "No todo es sobre mí. La mayoría de las veces, la gente está lidiando con sus propias batallas.",
      "Un silencio no es un rechazo. Puede ser fatiga, olvido o distracción del otro.",
      "Mi valor no disminuye por la falta de respuesta de alguien."
    ],
    'Crítica': [
      "La crítica es solo información, no una sentencia sobre mi identidad.",
      "Puedo separar lo que hago de lo que soy.",
      "Tengo derecho a cometer errores y seguir siendo valioso."
    ],
    'Inseguridad': [
      "Soy suficiente tal como soy, en este momento.",
      "Mis emociones son válidas, pero no siempre son hechos objetivos.",
      "Mi cerebro ADHD tiende a amplificar señales negativas; puedo elegir cuestionarlas."
    ]
  };

  const emotions = Object.keys(affirmations);
  const [index, setIndex] = useState(0);

  const currentAffirmations = selectedEmotion ? affirmations[selectedEmotion] : affirmations['Inseguridad'];

  return (
    <div className="space-y-6">
      <div className="card bg-linear-to-r from-primary-light to-secondary-light border-none text-center p-10 min-h-[300px] flex flex-col justify-center">
        <ShieldCheck className="w-12 h-12 mx-auto text-primary mb-6" />
        
        {!selectedEmotion ? (
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-primary-dark">¿Cómo te sientes hoy?</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {emotions.map(e => (
                <button 
                  key={e}
                  onClick={() => { setSelectedEmotion(e); setIndex(0); }}
                  className="btn btn-secondary btn-sm"
                >
                  {e}
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
            <p className="font-display font-medium text-xl text-[#3d3450] italic leading-relaxed mb-8">
              "{currentAffirmations[index % currentAffirmations.length]}"
            </p>
            <div className="flex justify-center gap-2">
              <button 
                onClick={() => setSelectedEmotion(null)}
                className="btn btn-secondary btn-sm"
              >
                Volver
              </button>
              <button 
                onClick={() => setIndex(index + 1)}
                className="btn btn-primary btn-sm"
              >
                Otra afirmación
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-4">Reality Check (Interactive)</h3>
        <p className="text-sm text-[#7a7089] mb-4">Usa este filtro cuando sientas que algo fue un ataque personal.</p>
        <div className="space-y-3">
          {[
            "¿Tengo pruebas reales o es una suposición?",
            "Si un amigo me contara esto, ¿qué le diría?",
            "¿Qué otras 3 razones podrían explicar esto?"
          ].map((q, i) => (
            <div key={i} className="flex gap-3 items-center p-4 bg-[#f5f0eb] rounded-xl group cursor-pointer hover:bg-white border border-transparent hover:border-primary-light transition-all">
              <div className="w-6 h-6 rounded-full border-2 border-primary-light flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                {i + 1}
              </div>
              <span className="text-xs font-semibold flex-1">{q}</span>
              <CheckCircle2 className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ state, setState }: any) => {
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
        setState(parsed);
        alert('Datos importados correctamente.');
      } catch (err) {
        alert('Error al importar archivo. Asegúrate de que es un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-display font-bold mb-6">Apariencia</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'default', label: 'Estándar', colors: 'bg-primary' },
            { id: 'dark', label: 'Oscuro (Próximamente)', colors: 'bg-[#3d3450]' },
            { id: 'boho', label: 'Boho', colors: 'bg-[#c4956a]' },
            { id: 'minimal', label: 'Minimal', colors: 'bg-[#666]' },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setAppTheme(t.id)}
              className={cn(
                "p-3 rounded-xl border flex items-center gap-3 transition-all",
                state.settings.theme === t.id ? "border-primary bg-primary-light" : "border-[#e8e0f0] bg-white"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full", t.colors)} />
              <span className="text-xs font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-6">Preferencias de la Interfaz</h3>
        
        <div className="space-y-4">
          {[
            { id: 'hyperfocusGuard', label: 'Guardián de Enfoque', desc: 'Recordatorio cada 90min para tomar un descanso' },
            { id: 'sounds', label: 'Efectos de Sonido', desc: 'Auditivos al completar tareas y metas' },
            { id: 'confetti', label: 'Celebración de Confeti', desc: 'Efectos visuales festivos en tus victorias' }
          ].map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 border border-[#e8e0f0] rounded-2xl">
              <div>
                <div className="text-sm font-bold">{s.label}</div>
                <div className="text-[10px] text-[#a9a0b5]">{s.desc}</div>
              </div>
              <button 
                onClick={() => toggle(s.id)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  state.settings[s.id] ? "bg-primary" : "bg-[#e8e0f0]"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
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
          <h3 className="font-display font-bold">Respaldo y Seguridad</h3>
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
              <div className="text-sm font-bold text-[#3d3450]">Exportar Datos</div>
              <p className="text-[10px] text-[#a9a0b5] leading-relaxed">Descarga localmente un archivo .json con toda tu configuración y registros.</p>
            </div>
          </button>

          <label className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-[#e8e0f0] hover:border-primary-light hover:bg-[#fcfaff] transition-all group text-left cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-secondary-light flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#3d3450]">Restaurar Backup</div>
              <p className="text-[10px] text-[#a9a0b5] leading-relaxed">Sube un archivo .json previamente exportado para recuperar tu información.</p>
            </div>
            <input type="file" className="hidden" accept=".json" onChange={importData} />
          </label>
        </div>
      </div>

      <div className="card border-danger-light bg-danger-light/10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-danger" />
          <h3 className="font-display font-bold text-danger">Zona de Peligro</h3>
        </div>
        
        <p className="text-xs text-[#7a7089] mb-6 leading-relaxed">
          Las siguientes acciones son **irreversibles**. Una vez eliminados, no se podrán recuperar tus tareas, hábitos ni historial de energía sin un backup previo.
        </p>

        <button 
          onClick={() => {
            if(confirm('¿Seguro que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full btn btn-secondary text-danger border-danger-light hover:bg-danger hover:text-white font-bold text-xs py-4"
        >
          <Trash2 className="w-4 h-4" />
          Borrar Base de Datos Local
        </button>
      </div>
    </div>
  );
};

const CycleSyncView = ({ state, setState }: any) => {
  const updateCycle = (date: string) => {
    setState((prev: any) => ({ ...prev, cycleStartDate: date }));
  };

  const getPhase = () => {
    if (!state.cycleStartDate) return null;
    const start = new Date(state.cycleStartDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) % 28;
    
    if (diff <= 5) return { name: 'Menstrual', emoji: '🩸', color: 'text-danger' };
    if (diff <= 14) return { name: 'Folicular', emoji: '🌱', color: 'text-accent' };
    if (diff <= 17) return { name: 'Ovulación', emoji: '✨', color: 'text-warning' };
    return { name: 'Lútea', emoji: '🔮', color: 'text-primary' };
  };

  const phase = getPhase();

  return (
    <div className="space-y-6">
      <div className="card">
        <label className="text-xs font-bold text-[#a9a0b5] uppercase block mb-2">Inicio del último ciclo</label>
        <input 
          type="date" 
          value={state.cycleStartDate}
          onChange={e => updateCycle(e.target.value)}
          className="w-full bg-[#f5f0eb] border-none rounded-xl px-4 py-2 text-sm font-medium outline-none mb-6"
        />

        {phase && (
          <div className="text-center p-6 bg-[#fcfaff] rounded-2xl border border-primary-light">
            <div className="text-5xl mb-4">{phase.emoji}</div>
            <h3 className={cn("font-display font-bold text-xl mb-2", phase.color)}>Fase {phase.name}</h3>
            <p className="text-xs text-[#7a7089] leading-relaxed">
              {phase.name === 'Menstrual' && 'Descanso, tareas ligeras, autocuidado.'}
              {phase.name === 'Folicular' && 'Energía subiendo. Proyectos creativos, brainstorming.'}
              {phase.name === 'Ovulación' && 'Máxima energía social. Reuniones importantes.'}
              {phase.name === 'Lútea' && 'Organización, cierre de proyectos, administración.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SleepView = ({ state, setState }: any) => {
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
        <h3 className="font-display font-bold mb-6 flex items-center gap-2"><Moon className="w-5 h-5" /> Rastreador de Sueño</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#a9a0b5] uppercase">Hora Dormir</label>
            <input type="time" className="w-full bg-[#f5f0eb] border-none rounded-xl px-3 py-2 text-sm mt-1 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#a9a0b5] uppercase">Hora Despertar</label>
            <input type="time" className="w-full bg-[#f5f0eb] border-none rounded-xl px-3 py-2 text-sm mt-1 outline-none" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-bold mb-4">Ritual de Desconexión</h3>
        <div className="space-y-2">
          {[
            { icon: '📱', text: 'Pantallas fuera (30 min antes)' },
            { icon: '👗', text: 'Preparar ropa de mañana' },
            { icon: '🧠', text: 'Vaciado mental rápido' },
            { icon: '📖', text: 'Leer 10 min (libro físico)' }
          ].map((step, i) => (
            <div 
              key={i} 
              onClick={() => toggleRitual(i)}
              className={cn(
                "flex items-center gap-3 p-3 bg-[#fcfaff] rounded-xl border border-[#e8e0f0] cursor-pointer transition-all",
                ritualState[i] && "bg-accent-light border-accent opacity-80"
              )}
            >
              <span className="text-xl">{step.icon}</span>
              <span className={cn("text-xs font-medium", ritualState[i] && "line-through")}>{step.text}</span>
              <div className={cn(
                "ml-auto w-5 h-5 border-2 border-[#e8e0f0] rounded-lg flex items-center justify-center",
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

const BodyDoubleView = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card text-center p-12">
      <motion.div 
        animate={{ scale: isActive ? [1, 1.05, 1] : 1 }} 
        transition={{ repeat: Infinity, duration: 4 }}
        className="text-6xl mb-6"
      >
        👩‍💻
      </motion.div>
      <h2 className="text-xl font-display font-bold mb-2">Compañera de Enfoque</h2>
      <p className="text-sm text-[#7a7089] mb-4">"Estoy aquí contigo. Juntas podemos con esto."</p>
      
      {isActive && (
        <div className="text-2xl font-display font-bold text-primary mb-8 animate-pulse">
          {formatTime(seconds)}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn("btn", isActive ? "btn-secondary" : "btn-primary")}
        >
          {isActive ? 'Pausar Sesión' : 'Iniciar Sesión'}
        </button>
        <button 
          onClick={() => { setIsActive(false); setSeconds(0); }}
          className="btn btn-secondary"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
};

const ImpulseCheckerView = () => {
  const [checks, setChecks] = useState(new Array(4).fill(false));
  const [evaluated, setEvaluated] = useState(false);

  const toggleCheck = (idx: number) => {
    const next = [...checks];
    next[idx] = !next[idx];
    setChecks(next);
  };

  const getResult = () => {
    const score = checks.filter(c => c).length;
    if (score >= 3) return { text: "Parece una decisión razonable. Adelante con precaución.", color: "text-accent" };
    if (score >= 2) return { text: "Espera 24 horas antes de decidir. La dopamina bajará.", color: "text-warning" };
    return { text: "Impulso detectado. Detente y vuelve mañana.", color: "text-danger" };
  };

  return (
    <div className="card bg-warning-light border-warning p-8 text-center">
      <div className="text-5xl mb-4">🤔</div>
      <h3 className="font-display font-bold text-xl mb-6">¿Realmente lo necesitas?</h3>
      <div className="space-y-4 text-left max-w-xs mx-auto mb-8">
        {[
          '¿Lo he pensado por más de 24 horas?',
          '¿Encaja en mi presupuesto real?',
          '¿Es una necesidad o un deseo impulsivo?',
          '¿Me sentiré bien mañana sobre esto?'
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
        {evaluated ? 'Re-evaluar' : 'Evaluar Impulso'}
      </button>
    </div>
  );
};

const TravelKitView = ({ state, setState }: any) => {
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
            placeholder="Item para el viaje..."
            className="flex-1 bg-[#f5f0eb] border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
          />
          <button onClick={addItem} className="btn btn-primary btn-sm">Añadir</button>
        </div>

        <div className="space-y-2">
          {state.travelItems.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border border-[#e8e0f0] rounded-xl">
              <button 
                onClick={() => {
                  const newItems = state.travelItems.map((i: any) => i.id === item.id ? { ...i, checked: !i.checked } : i);
                  setState((prev: any) => ({ ...prev, travelItems: newItems }));
                }}
                className={cn(
                  "w-5 h-5 border-2 rounded transition-all",
                  item.checked ? "bg-accent border-accent" : "border-[#e8e0f0]"
                )}
              />
              <span className={cn("text-xs font-medium", item.checked && "line-through opacity-50")}>{item.text}</span>
              <button 
                onClick={() => setState((prev: any) => ({ ...prev, travelItems: prev.travelItems.filter((i: any) => i.id !== item.id) }))}
                className="ml-auto p-1 text-[#a9a0b5] hover:text-danger"
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

function renderView(state: any, setState: any, navigateTo: any) {
  switch (state.currentView) {
    case 'dashboard': return <DashboardView state={state} setState={setState} navigateTo={navigateTo} />;
    case 'morning': return <MorningLaunchView state={state} setState={setState} navigateTo={navigateTo} />;
    case 'tasks': return <TasksView state={state} setState={setState} />;
    case 'timer': return <TimerView state={state} setState={setState} />;
    case 'braindump': return <BrainDumpView state={state} setState={setState} navigateTo={navigateTo} />;
    case 'energy': return <EnergyTrackerView state={state} setState={setState} />;
    case 'dopamine': return <DopamineMenuView state={state} setState={setState} />;
    case 'habits': return <HabitTrackerView state={state} setState={setState} />;
    case 'meds': return <MedsView state={state} setState={setState} />;
    case 'wins': return <WinsJournalView state={state} setState={setState} />;
    case 'rsd': return <RsdShieldView state={state} />;
    case 'settings': return <SettingsView state={state} setState={setState} />;
    case 'cycle': return <CycleSyncView state={state} setState={setState} />;
    case 'sleep': return <SleepView state={state} setState={setState} />;
    case 'bodydouble': return <BodyDoubleView />;
    case 'impulse': return <ImpulseCheckerView />;
    case 'travel': return <TravelKitView state={state} setState={setState} />;
    case 'rescue': return <OverwhelmRescueView state={state} />;
    default: return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-16 h-16 text-[#a9a0b5] mb-4" />
        <h2 className="text-xl font-display font-bold">Funcionalidad no disponible</h2>
        <p className="text-[#7a7089]">Esta vista está en desarrollo para el Centro de Control.</p>
        <button 
          onClick={() => navigateTo('dashboard')}
          className="mt-6 btn btn-primary"
        >
          Volver al Panel General
        </button>
      </div>
    );
  }
}

// --- View Components ---

const DashboardView = ({ state, setState, navigateTo }: any) => {
  const today = new Date().toDateString();
  const todayTasks = state.tasks.filter((t: any) => new Date(t.created).toDateString() === today);
  const completedToday = todayTasks.filter((t: any) => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tareas Hoy', value: todayTasks.length, icon: Target },
          { label: 'Completadas', value: completedToday, icon: CheckCircle2 },
          { label: 'Min Foco', value: state.timerState.totalFocusMinutes, icon: Timer },
          { label: 'Wins Hoy', value: state.wins.filter((w: any) => new Date(w.date).toDateString() === today).length, icon: Trophy }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#e8e0f0] p-4 rounded-xl text-center">
            <stat.icon className="w-5 h-5 mx-auto mb-2 text-[#a9a0b5]" />
            <div className="text-2xl font-display font-bold text-[#3d3450]">{stat.value}</div>
            <div className="text-[10px] text-[#a9a0b5] uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {state.dailyPriority && (
        <div className="bg-linear-to-r from-primary-light to-secondary-light rounded-2xl p-6 text-center border border-white/50">
          <div className="text-[10px] uppercase tracking-widest font-bold text-primary-dark mb-2">🎯 Prioridad de Hoy</div>
          <div className="text-xl font-display font-bold text-[#3d3450]">{state.dailyPriority}</div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Tareas Pendientes
            </h3>
            <button onClick={() => navigateTo('tasks')} className="text-xs font-semibold text-primary">Ver todas</button>
          </div>
          <div className="space-y-2">
            {state.tasks.filter((t: any) => !t.completed).slice(0, 5).map((task: any) => (
              <div 
                key={task.id} 
                className="flex items-center gap-3 p-3 border border-[#e8e0f0] rounded-xl hover:bg-[#f5f0eb] cursor-pointer transition-colors"
                onClick={() => {
                  const newTasks = state.tasks.map((t: any) => t.id === task.id ? { ...t, completed: true } : t);
                  setState((prev: any) => ({ ...prev, tasks: newTasks }));
                }}
              >
                <div className="w-5 h-5 border-2 border-[#e8e0f0] rounded-full" />
                <span className="text-sm font-medium">{task.text}</span>
              </div>
            ))}
            {state.tasks.filter((t: any) => !t.completed).length === 0 && (
              <div className="text-center py-8 text-[#a9a0b5]">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">¡Todo despejado!</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" /> Wins Recientes
            </h3>
            <button onClick={() => navigateTo('wins')} className="text-xs font-semibold text-primary">Journal</button>
          </div>
          <div className="space-y-2">
            {state.wins.slice(0, 3).map((win: any) => (
              <div key={win.id} className="flex gap-3 p-3 bg-accent-light border-l-4 border-accent rounded-r-xl">
                <span className="text-lg">✨</span>
                <div>
                  <div className="text-xs font-semibold">{win.text}</div>
                  <div className="text-[10px] text-[#a9a0b5]">{new Date(win.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {state.wins.length === 0 && (
              <div className="text-center py-8 text-[#a9a0b5]">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Registra tu primer éxito del día</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksView = ({ state, setState }: any) => {
  const [filter, setFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [priority, setPriority] = useState<Priority>('p3');

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

  const filteredTasks = state.tasks.filter((t: any) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-[#e8e0f0]">
          {['all', 'pending', 'completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold capitalize",
                filter === f ? "bg-primary text-white" : "text-[#7a7089]"
              )}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Hechas'}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn btn-primary btn-sm flex gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva Tarea
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
            <div className="card bg-[#fcfaff] border-primary-light">
              <div className="space-y-4">
                <input 
                  autoFocus
                  placeholder="¿En qué quieres enfocarte?" 
                  className="w-full bg-transparent border-none text-lg font-display font-medium outline-none placeholder:text-[#a9a0b5]"
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
                            : "border-[#e8e0f0] text-[#7a7089]"
                        )}
                      >
                        {p === 'p1' ? 'Crítica' : p === 'p2' ? 'Importante' : 'Normal'}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsAdding(false)} className="btn text-sm">Cancelar</button>
                    <button onClick={addTask} className="btn btn-primary btn-sm">Añadir</button>
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
              "flex items-center gap-4 p-4 bg-white border border-[#e8e0f0] rounded-2xl group transition-all",
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
                task.completed ? "bg-accent border-accent text-white" : "border-[#e8e0f0] hover:border-primary"
              )}
            >
              {task.completed && <CheckCircle2 className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <div className={cn("text-sm font-medium", task.completed && "line-through text-[#a9a0b5]")}>
                {task.text}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-[9px] uppercase font-bold tracking-wider",
                  task.priority === 'p1' ? "text-danger" : task.priority === 'p2' ? "text-warning" : "text-accent"
                )}>
                  {task.priority === 'p1' ? 'Crítica' : task.priority === 'p2' ? 'Importante' : 'Normal'}
                </span>
              </div>
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
          <div className="text-center py-12 text-[#a9a0b5]">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-display font-medium">No hay tareas que mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TimerView = ({ state, setState }: any) => {
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
          <div className="text-[10px] text-[#a9a0b5] font-bold uppercase tracking-widest mb-2">Sesión de Enfoque</div>
          <div className="text-7xl font-display font-bold text-[#3d3450] tracking-tighter mb-8 transition-all duration-300">
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
              className="w-14 h-14 bg-white border border-[#e8e0f0] rounded-full flex items-center justify-center hover:bg-[#f5f0eb]"
            >
              <RotateCcw className="w-6 h-6 text-[#7a7089]" />
            </button>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button className="w-14 h-14 bg-white border border-[#e8e0f0] rounded-full flex items-center justify-center hover:bg-[#f5f0eb]">
              <Volume2 className="w-6 h-6 text-[#7a7089]" />
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
                    ? "bg-primary border-primary text-white" 
                    : "bg-white border-[#e8e0f0] text-[#7a7089] hover:border-primary-light"
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BrainDumpView = ({ state, setState, navigateTo }: any) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('idea');

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
          placeholder="Vierte tus pensamientos sin filtro..."
          className="w-full bg-transparent border-none text-lg font-medium outline-none placeholder:text-[#a9a0b5] min-h-[150px] resize-none"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#e8e0f0]">
          <select 
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="bg-[#f5f0eb] border-none rounded-xl px-4 py-2 text-xs font-semibold outline-none"
          >
            <option value="trabajo">💼 Trabajo</option>
            <option value="personal">🏠 Personal</option>
            <option value="urgente">🔴 Urgente</option>
            <option value="idea">💡 Idea</option>
            <option value="compra">🛒 Compra</option>
          </select>
          <div className="flex-1" />
          <button onClick={convertToTask} className="btn btn-secondary text-sm">📋 Convertir a Tarea</button>
          <button onClick={addDump} className="btn btn-primary text-sm px-8">Guardar</button>
        </div>
      </div>

      <div className="space-y-3">
        {state.brainDumps.map((dump: any) => (
          <div key={dump.id} className="card p-4 hover:border-primary-light border-dashed">
            <p className="text-sm leading-relaxed mb-3">{dump.text}</p>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#a9a0b5] uppercase tracking-wider">
              <span className={cn(
                "px-2 py-0.5 rounded-full border",
                dump.category === 'urgente' ? "text-danger border-danger-light" : "text-primary border-primary-light"
              )}>
                {dump.category}
              </span>
              <span>{new Date(dump.created).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

