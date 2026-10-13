import React, { useState, useEffect } from 'react';
import { Routine, Exercise } from '../types';
import { Instructor3D } from './Instructor3D';
import { 
  Dumbbell, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  X,
  HeartPulse,
  Eye,
  Home
} from 'lucide-react';

interface WorkoutRoutinesProps {
  routines: Routine[];
  activeWorkout: Routine | null;
  onStartRoutine: (routine: Routine) => void;
  onCloseWorkoutPlayer: () => void;
}

export const WorkoutRoutines: React.FC<WorkoutRoutinesProps> = ({
  routines,
  activeWorkout,
  onStartRoutine,
  onCloseWorkoutPlayer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const filteredRoutines = routines.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Equipment-Free Guarantee */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                100% Sin Equipamiento · Entrena en Casa
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Diseñado para 120 kg · 30 Años</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Rutinas con Autocarga & Instructor 3D
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              No necesitas mancuernas, barras ni bicicletas estáticas. Todos los ejercicios utilizan tu propio <strong className="text-zinc-200">peso corporal, la pared de tu casa o una silla firme</strong>. Cada movimiento cuenta con un <strong className="text-emerald-400">modelo 3D interactivo en 360º</strong> para que domines la postura exacta y protejas tus rodillas en cada repetición.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1.5 shrink-0">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Equipamiento Necesario:
            </div>
            <ul className="text-zinc-400 space-y-1 text-[11px]">
              <li>✓ Solo tu peso corporal</li>
              <li>✓ Una pared para isométricos</li>
              <li>✓ Una silla o sofá firme</li>
              <li>✓ Cero impacto destructor en meniscos</li>
            </ul>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todas ({routines.length})
          </button>
          <button
            onClick={() => setSelectedCategory('knee_prehab')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'knee_prehab'
                ? 'bg-zinc-800 text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🛡️ Blindaje Rodilla & Pared
          </button>
          <button
            onClick={() => setSelectedCategory('futsal_cardio')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'futsal_cardio'
                ? 'bg-zinc-800 text-cyan-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ⚡ Cardio Futsal en Casa (Sin Salto)
          </button>
          <button
            onClick={() => setSelectedCategory('f9_stamina')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'f9_stamina'
                ? 'bg-zinc-800 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            💪 Calistenia Fútbol 9
          </button>
          <button
            onClick={() => setSelectedCategory('match_activation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'match_activation'
                ? 'bg-zinc-800 text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🔥 Activación Pre-Partido
          </button>
          <button
            onClick={() => setSelectedCategory('post_match_recovery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'post_match_recovery'
                ? 'bg-zinc-800 text-purple-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🧊 Descarga en Pared
          </button>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRoutines.map((routine) => {
          return (
            <div
              key={routine.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    {routine.categoryLabel}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{routine.durationMin} min</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-300 font-medium">{routine.difficulty}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1.5">
                  {routine.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {routine.description}
                </p>

                {/* Impact Level Badge & Equipment Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs font-medium text-emerald-400">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>{routine.jointImpactLevel}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300">
                    <Home className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Cero equipo / Casa</span>
                  </div>
                </div>

                {/* Exercise List Preview with 3D Preview button for each */}
                <div className="space-y-2 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/80">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Ejercicios ({routine.exercises.length}):</span>
                    <span className="text-[10px] text-emerald-400 lowercase font-normal">click para ver 3D</span>
                  </div>
                  <div className="space-y-2">
                    {routine.exercises.map((ex, idx) => (
                      <div key={ex.id} className="text-xs text-zinc-300 flex items-center justify-between gap-2 p-1.5 rounded hover:bg-zinc-900/60 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-zinc-500 font-mono text-[11px]">{idx + 1}.</span>
                          <span className="font-medium text-zinc-200 truncate">{ex.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {ex.sets}x {ex.repsOrTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewExercise(ex)}
                            className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition-colors"
                            title="Ver demostración 3D del ejercicio"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-500 truncate max-w-xs">
                  {routine.targetGoal}
                </span>
                <button
                  onClick={() => onStartRoutine(routine)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>Entrenar con Instructor 3D</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick 3D Exercise Preview Modal (when clicking the Eye icon on any exercise) */}
      {previewExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Demostración 3D del Ejercicio</span>
                <h3 className="text-base font-bold text-white">{previewExercise.name}</h3>
              </div>
              <button
                onClick={() => setPreviewExercise(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Instructor3D
              animationType={previewExercise.animationType}
              exerciseName={previewExercise.name}
              jointSafetyTip={previewExercise.jointSafetyTip}
            />

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
              <div className="text-[11px] font-bold text-zinc-400">Material necesario en casa:</div>
              <p className="text-emerald-400 font-medium">{previewExercise.equipmentNeeded}</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewExercise(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                Cerrar Vista 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Workout Player Modal (with Full Integrated 3D Instructor) */}
      {activeWorkout && (
        <WorkoutPlayer
          routine={activeWorkout}
          onClose={onCloseWorkoutPlayer}
        />
      )}
    </div>
  );
};

// Interactive Step-by-Step Workout Player with Built-in 3D Instructor & Timer
interface WorkoutPlayerProps {
  routine: Routine;
  onClose: () => void;
}

const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ routine, onClose }) => {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExercise = routine.exercises[currentExIndex];
  const totalExercises = routine.exercises.length;

  // Extract numeric seconds if repsOrTime mentions seconds, else default restSec
  useEffect(() => {
    if (!currentExercise) return;
    const match = currentExercise.repsOrTime.match(/(\d+)\s*segundo/i);
    if (match) {
      setTimerSeconds(parseInt(match[1], 10));
    } else {
      setTimerSeconds(currentExercise.restSec || 45);
    }
    setIsTimerRunning(false);
  }, [currentExIndex, currentExercise]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch {
        // audio unavailable
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleNext = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      setTimerSeconds(currentExercise.restSec || 45);
      setIsTimerRunning(false);
    } else if (currentExIndex < totalExercises - 1) {
      setCurrentExIndex((prev) => prev + 1);
      setCurrentSet(1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentSet > 1) {
      setCurrentSet((prev) => prev - 1);
    } else if (currentExIndex > 0) {
      setCurrentExIndex((prev) => prev - 1);
      setCurrentSet(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border-0 sm:border sm:border-zinc-800 rounded-none sm:rounded-2xl w-full max-w-4xl my-auto overflow-hidden shadow-2xl flex flex-col h-full sm:h-auto max-h-[100dvh] sm:max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Entrenamiento Guiado 3D</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">Sin Equipo</span>
            </div>
            <h2 className="text-sm sm:text-lg font-bold text-white truncate max-w-[260px] sm:max-w-md">
              {routine.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          /* Completion Screen */
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">¡Entrenamiento Completado con Éxito!</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Excelente sesión con autocarga. Has protegido tus articulaciones sin castigarlas con saltos ni peso excesivo.
            </p>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 max-w-sm mx-auto">
              💧 Bebe al menos 500ml de agua ahora mismo para mantener lubricado el cartílago rotuliano.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-sm hover:bg-emerald-400 transition-colors"
            >
              Finalizar y Volver al Panel
            </button>
          </div>
        ) : (
          /* Active Workout Screen: Left 3D Instructor + Right Exercise Guide & Timer */
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                Ejercicio <strong className="text-white">{currentExIndex + 1}</strong> de {totalExercises}: <strong className="text-zinc-200">{currentExercise.name}</strong>
              </span>
              <span>
                Serie <strong className="text-emerald-400">{currentSet}</strong> de {currentExercise.sets}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentExIndex + 1) / totalExercises) * 100}%` }}
              />
            </div>

            {/* Split Grid: 3D Model on Left/Top, Controls & Instructions on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Left Column: 3D Instructor Model */}
              <div className="space-y-3">
                <Instructor3D
                  animationType={currentExercise.animationType}
                  exerciseName={currentExercise.name}
                  jointSafetyTip={currentExercise.jointSafetyTip}
                />

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">En casa necesitas:</span>
                  <span className="font-semibold text-emerald-400">{currentExercise.equipmentNeeded}</span>
                </div>
              </div>

              {/* Right Column: Timer, Instructions, Reps */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {currentExercise.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {currentExercise.repsOrTime}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      Músculo: {currentExercise.focusMuscle}
                    </span>
                  </div>
                </div>

                {/* Built-in Timer Control */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center">
                  <div className="text-4xl font-mono font-black tracking-wider text-white">
                    {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 uppercase font-semibold">
                    {isTimerRunning ? 'Tiempo en marcha' : 'Pausado'}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm ${
                        isTimerRunning
                          ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                          : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-4 h-4" /> <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-zinc-950" /> <span>Iniciar Cronómetro</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(currentExercise.restSec || 45);
                      }}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Step Instructions */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Paso a Paso de Ejecución:
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal pl-4">
                    {currentExercise.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentExIndex === 0 && currentSet === 1}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{currentSet < currentExercise.sets ? 'Siguiente Serie' : 'Siguiente Ejercicio'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
