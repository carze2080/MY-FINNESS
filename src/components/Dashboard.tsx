import React from 'react';
import { UserProfile, MatchRecord, Routine, MealItem } from '../types';
import { 
  ShieldAlert, 
  Flame, 
  Droplets, 
  Dumbbell, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  HeartPulse,
  Plus
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  matches: MatchRecord[];
  routines: Routine[];
  meals: MealItem[];
  waterToday: number;
  dayType: 'match_day' | 'training_day' | 'rest_day';
  onSetDayType: (type: 'match_day' | 'training_day' | 'rest_day') => void;
  onAddWater: (amountMl: number) => void;
  onNavigate: (tab: string) => void;
  onStartRoutine: (routine: Routine) => void;
  onOpenNewMatch: () => void;
  onOpenAICoach: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  matches,
  routines,
  meals,
  waterToday,
  dayType,
  onSetDayType,
  onAddWater,
  onNavigate,
  onStartRoutine,
  onOpenNewMatch,
  onOpenAICoach,
}) => {
  const latestMatch = matches[0];

  // Calculate calories today
  const caloriesToday = meals.reduce((sum, m) => sum + m.calories, 0);
  const proteinToday = meals.reduce((sum, m) => sum + m.proteinG, 0);
  const targetCalories =
    dayType === 'match_day'
      ? profile.calorieTarget.matchDay
      : dayType === 'training_day'
      ? profile.calorieTarget.trainingDay
      : profile.calorieTarget.restDay;

  // Determine Joint Load Status based on recent knee strain
  const recentKneeStress = latestMatch ? latestMatch.kneeDiscomfort : 2;
  const jointStatus =
    recentKneeStress <= 2
      ? { label: 'Óptimo / Protegido', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60', icon: CheckCircle2 }
      : recentKneeStress === 3
      ? { label: 'Carga Moderada (Vigilar)', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60', icon: ShieldAlert }
      : { label: 'Sobrecarga Articular (Descargar)', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60', icon: ShieldAlert };

  const JointIcon = jointStatus.icon;

  // Recommended routine: Prehab knees if strain, or Futsal/F9 conditioning
  const recommendedRoutine = recentKneeStress >= 3 
    ? routines.find((r) => r.category === 'post_match_recovery') || routines[0]
    : routines.find((r) => r.category === 'knee_prehab') || routines[0];

  return (
    <div className="space-y-6">
      {/* Top Profile & Joint Shield Alert Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 tracking-wider uppercase font-mono">
                Perfil Deportivo
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[11px] sm:text-xs text-zinc-400">30 años · {profile.currentWeightKg} kg</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Hola, crack. Hoy es día de preparación.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              En <strong className="text-zinc-200">Fútbol Sala</strong> (pivoteo, cambios de dirección) y <strong className="text-zinc-200">Fútbol 9</strong> (choques y transiciones), tu peso de 120kg exige fuerza funcional y rodillas blindadas con cero impacto.
            </p>
          </div>

          {/* Quick Joint Health Widget */}
          <div className={`p-3 sm:p-4 rounded-xl border ${jointStatus.bg} flex items-center gap-3 shrink-0`}>
            <JointIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${jointStatus.color} shrink-0`} />
            <div>
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Estado Articular Actual</div>
              <div className={`text-xs sm:text-sm font-bold ${jointStatus.color}`}>{jointStatus.label}</div>
              <div className="text-[10px] sm:text-[11px] text-zinc-400">
                Último reporte: {recentKneeStress}/5 molestia
              </div>
            </div>
          </div>
        </div>

        {/* Day Type Selector - 3-col grid on phones */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-medium text-zinc-400">
            ¿Qué actividad tienes hoy?
          </span>
          <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <button
              onClick={() => onSetDayType('match_day')}
              className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors text-center ${
                dayType === 'match_day'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ⚽ Partido
            </button>
            <button
              onClick={() => onSetDayType('training_day')}
              className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors text-center ${
                dayType === 'training_day'
                  ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🏋️ Fuerza
            </button>
            <button
              onClick={() => onSetDayType('rest_day')}
              className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors text-center ${
                dayType === 'rest_day'
                  ? 'bg-zinc-800 text-zinc-200 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🛌 Descanso
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards: Nutrition, Hydration, Match Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Calories & Nutrition */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Calorías & Déficit Seguro
              </span>
              <button
                onClick={() => onNavigate('diet')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                Detalle <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{caloriesToday}</span>
              <span className="text-sm text-zinc-500 font-medium">/ {targetCalories} kcal</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (caloriesToday / targetCalories) * 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            <span>Proteína hoy: <strong className="text-zinc-200">{proteinToday}g</strong></span>
            <span className="text-zinc-500">
              {dayType === 'match_day' ? 'Modo Carga Pre-Partido' : 'Déficit Controlado'}
            </span>
          </div>
        </div>

        {/* Card 2: Hydration (Crucial at 120kg) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Hidratación Articular
              </span>
              <span className="text-xs text-zinc-500 font-mono">Meta: {profile.waterGoalLiters} L</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{(waterToday / 1000).toFixed(1)}</span>
              <span className="text-sm text-zinc-500 font-medium">/ {profile.waterGoalLiters} Litros</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (waterToday / (profile.waterGoalLiters * 1000)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Previene calambres a 120kg</span>
            <button
              onClick={() => onAddWater(250)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 rounded hover:bg-cyan-900/60 transition-colors"
            >
              <Plus className="w-3 h-3" /> +250 ml
            </button>
          </div>
        </div>

        {/* Card 3: Match Rating & Performance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Rendimiento en Cancha
              </span>
              <button
                onClick={() => onNavigate('matches')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                Histórico <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {latestMatch ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white line-clamp-1">
                    {latestMatch.title}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {latestMatch.type === 'futsal' ? 'Fútbol Sala' : 'Fútbol 9'} · {latestMatch.position}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-black text-emerald-400 leading-none">
                    {latestMatch.overallMatchRating.toFixed(1)}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-emerald-400/80">Nota</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-500 py-2">No hay partidos registrados aún</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            {latestMatch ? (
              <>
                <span>Goles: <strong className="text-zinc-200">{latestMatch.goals}</strong> · Duelos: <strong className="text-zinc-200">{latestMatch.duelsWon}</strong></span>
                <span className="text-emerald-400 font-medium">{latestMatch.minutesPlayed} min jugados</span>
              </>
            ) : (
              <span>Registra tu primer partido</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Workout & Tactical Debrief Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recommended Routine Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4" />
                Rutina Recomendada · Sin Equipo (Casa)
              </span>
              <span className="text-xs text-zinc-500">{recommendedRoutine.durationMin} minutos</span>
            </div>
            <h2 className="text-lg font-bold text-white">{recommendedRoutine.title}</h2>
            <p className="text-xs text-zinc-400 mt-1 mb-3 leading-relaxed">
              {recommendedRoutine.description}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ✓ Solo peso corporal, pared y silla
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                🎮 Instructor 3D en 360º
              </span>
            </div>

            <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Ejercicios Clave ({recommendedRoutine.exercises.length}):
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5">
                {recommendedRoutine.exercises.slice(0, 3).map((ex) => (
                  <li key={ex.id} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">·</span>
                    <div>
                      <strong className="text-zinc-200">{ex.name}</strong> ({ex.sets} series x {ex.repsOrTime})
                      <span className="block text-[11px] text-zinc-500">{ex.focusMuscle}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              {recommendedRoutine.jointImpactLevel}
            </span>
            <button
              onClick={() => onStartRoutine(recommendedRoutine)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Iniciar Entrenamiento Guiado</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Latest Match AI Debrief & Biomechanical Tip */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Informe Táctico & Físico AI
              </span>
              {latestMatch && (
                <span className="text-xs text-zinc-500">{latestMatch.date}</span>
              )}
            </div>

            {latestMatch?.aiDebrief ? (
              <div className="space-y-3">
                <div className="bg-zinc-950/70 p-3.5 rounded-lg border border-zinc-800/80">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Análisis en Cancha ({latestMatch.type === 'futsal' ? 'Fútbol Sala' : 'Fútbol 9'}):
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {latestMatch.aiDebrief.tacticalSummary}
                  </p>
                </div>

                <div className="bg-zinc-950/70 p-3.5 rounded-lg border border-zinc-800/80">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Salud de Rodillas & Peso (120kg):
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {latestMatch.aiDebrief.physicalAssessment}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-xs">
                Registra tu próximo partido para recibir un desglose táctico y físico con recomendaciones de rodilla y nutrición.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={onOpenAICoach}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consultar al Preparador Físico AI</span>
            </button>
            <button
              onClick={onOpenNewMatch}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Registrar Nuevo Partido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
