import React from 'react';
import { Activity, Dumbbell, Utensils, TrendingDown, Bot, PlusCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewMatch: () => void;
  onOpenAICoach: () => void;
  currentWeight: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewMatch,
  onOpenAICoach,
  currentWeight,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Resumen', shortLabel: 'Inicio', icon: Activity },
    { id: 'matches', label: 'En Cancha', shortLabel: 'Partidos', icon: ShieldCheck },
    { id: 'workouts', label: 'Entrenamientos', shortLabel: 'Entrenar', icon: Dumbbell },
    { id: 'diet', label: 'Nutrición', shortLabel: 'Dieta', icon: Utensils },
    { id: 'weight', label: 'Peso & Salud', shortLabel: 'Peso', icon: TrendingDown },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Identity */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black tracking-wider text-xs sm:text-sm shadow-sm shrink-0">
                MF
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold tracking-tight text-white text-sm sm:text-base">MATCHFIT</span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-medium">SALA & F9</span>
                </div>
                <p className="text-[10px] text-zinc-400 hidden xs:block sm:block">
                  {currentWeight} kg · Cero Equipo
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-zinc-800 text-emerald-400 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onOpenAICoach}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm min-h-[38px]"
                title="Consultar al Entrenador & Nutricionista AI"
              >
                <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden xs:inline sm:inline">Coach AI</span>
              </button>

              <button
                onClick={onOpenNewMatch}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-sm min-h-[38px]"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="hidden xs:inline">Evaluar Partido</span>
                <span className="xs:hidden">Partido</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Ergonomic Mobile Bottom Navigation Bar (Phone-Native Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/90 pb-safe">
        <div className="grid grid-cols-5 h-15">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 w-full h-full py-1.5 transition-colors select-none ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110 bg-emerald-500/10' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight leading-none truncate max-w-[62px]">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
