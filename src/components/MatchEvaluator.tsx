import React, { useState } from 'react';
import { MatchRecord, UserProfile, MatchType } from '../types';
import { calculateMatchRating } from '../utils/ratingCalculator';
import { geminiService } from '../services/geminiService';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Target, 
  Shield, 
  Zap,
  HelpCircle,
  X
} from 'lucide-react';

interface MatchEvaluatorProps {
  matches: MatchRecord[];
  profile: UserProfile;
  onAddMatch: (match: MatchRecord) => void;
  onDeleteMatch: (id: string) => void;
  isOpenNewMatchModal: boolean;
  onCloseNewMatchModal: () => void;
  onOpenNewMatchModal: () => void;
}

export const MatchEvaluator: React.FC<MatchEvaluatorProps> = ({
  matches,
  profile,
  onAddMatch,
  onDeleteMatch,
  isOpenNewMatchModal,
  onCloseNewMatchModal,
  onOpenNewMatchModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'futsal' | 'futbol9'>('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(matches[0]?.id || null);
  const [isGeneratingDebrief, setIsGeneratingDebrief] = useState<string | null>(null);

  const filteredMatches = matches.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  // Aggregated Stats
  const totalMatches = filteredMatches.length;
  const avgRating = totalMatches > 0
    ? (filteredMatches.reduce((s, m) => s + m.overallMatchRating, 0) / totalMatches).toFixed(1)
    : '0.0';
  const totalGoals = filteredMatches.reduce((s, m) => s + m.goals, 0);
  const totalAssists = filteredMatches.reduce((s, m) => s + m.assists, 0);
  const totalMinutes = filteredMatches.reduce((s, m) => s + m.minutesPlayed, 0);
  const totalDuelsWon = filteredMatches.reduce((s, m) => s + m.duelsWon, 0);
  const totalDuelsLost = filteredMatches.reduce((s, m) => s + m.duelsLost, 0);
  const duelSuccessRate = totalDuelsWon + totalDuelsLost > 0
    ? Math.round((totalDuelsWon / (totalDuelsWon + totalDuelsLost)) * 100)
    : 0;
  const avgKneeDiscomfort = totalMatches > 0
    ? (filteredMatches.reduce((s, m) => s + m.kneeDiscomfort, 0) / totalMatches).toFixed(1)
    : '1.0';

  // Request AI Debrief on an existing match if not already generated
  const handleRegenerateDebrief = async (match: MatchRecord) => {
    setIsGeneratingDebrief(match.id);
    try {
      const debrief = await geminiService.analyzeMatch(match, profile);
      const updatedMatch = { ...match, aiDebrief: debrief };
      onAddMatch(updatedMatch); // will overwrite or add
    } finally {
      setIsGeneratingDebrief(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Evaluación en Cancha
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sala & F9
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Analiza tu rendimiento táctico, efectividad de juego y desgaste articular tras cada encuentro.
          </p>
        </div>

        <button
          onClick={onOpenNewMatchModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Evaluar Nuevo Partido</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-3.5">
          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Partidos Evaluados</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{totalMatches}</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">{totalMinutes} min jugados</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-3.5">
          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Nota Promedio</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 sm:mt-1">{avgRating}</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">Escala 1.0 a 10.0</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-3.5">
          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Goles Totales</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{totalGoals}</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">
            {totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : 0} por partido
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-3.5">
          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Asistencias</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{totalAssists}</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">Pases a gol</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-3.5">
          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Duelos Ganados</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 sm:mt-1">{duelSuccessRate}%</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">{totalDuelsWon} ganados (120kg)</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-3.5">
          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Molestia Rodillas</div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5 sm:mt-1">{avgKneeDiscomfort} <span className="text-xs text-zinc-500 font-normal">/ 5</span></div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">Post-juego</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-lg border border-zinc-800 w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            filterType === 'all'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Todos ({matches.length})
        </button>
        <button
          onClick={() => setFilterType('futsal')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            filterType === 'futsal'
              ? 'bg-zinc-800 text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Fútbol Sala ({matches.filter((m) => m.type === 'futsal').length})
        </button>
        <button
          onClick={() => setFilterType('futbol9')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            filterType === 'futbol9'
              ? 'bg-zinc-800 text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Fútbol 9 ({matches.filter((m) => m.type === 'futbol9').length})
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No hay partidos en esta categoría</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Registra tu último juego de fútbol sala o fútbol 9 para calcular tu nota y fatiga.
            </p>
            <button
              onClick={onOpenNewMatchModal}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Evaluar Partido Ahora
            </button>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isExpanded = expandedMatchId === match.id;
            const isFutsal = match.type === 'futsal';
            const resultLabel =
              match.result === 'win'
                ? { text: 'Victoria', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' }
                : match.result === 'draw'
                ? { text: 'Empate', color: 'text-zinc-300 bg-zinc-800/60 border-zinc-700/60' }
                : { text: 'Derrota', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };

            return (
              <div
                key={match.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                {/* Match Card Header */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* SofaScore-style Match Rating badge */}
                    <div className="h-14 w-14 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
                      <span
                        className={`text-xl font-black leading-none ${
                          match.overallMatchRating >= 8.0
                            ? 'text-emerald-400'
                            : match.overallMatchRating >= 6.5
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {match.overallMatchRating.toFixed(1)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">
                        Nota
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {isFutsal ? 'FÚTBOL SALA' : 'FÚTBOL 9'}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs text-zinc-400">{match.date}</span>
                        <span className="text-zinc-600">·</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${resultLabel.color}`}>
                          {resultLabel.text} ({match.scoreOwn} - {match.scoreRival})
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                        {match.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Posición: <strong className="text-zinc-200">{match.position}</strong> · {match.minutesPlayed} minutos en cancha
                      </p>
                    </div>
                  </div>

                  {/* Actions & Key Indicators */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                        ⚽ {match.goals} {match.goals === 1 ? 'gol' : 'goles'}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                        🎯 {match.assists} asist.
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5"
                      >
                        <span>{isExpanded ? 'Ocultar' : 'Detalles & AI'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onDeleteMatch(match.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Technical Grid + Physical/Joint Analysis + AI Debrief */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 space-y-4 border-t border-zinc-800/80 pt-4 bg-zinc-950/40">
                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-center">
                      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Tiros a Puerta</div>
                        <div className="text-base font-black text-white mt-0.5">{match.shotsOnTarget}</div>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Pases Clave</div>
                        <div className="text-base font-black text-white mt-0.5">{match.keyPasses}</div>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Recuperaciones</div>
                        <div className="text-base font-black text-white mt-0.5">{match.ballsRecovered}</div>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Duelos Ganados</div>
                        <div className="text-base font-black text-amber-400 mt-0.5">
                          {match.duelsWon} / {match.duelsWon + match.duelsLost}
                        </div>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Fatiga Final</div>
                        <div className="text-base font-black text-cyan-400 mt-0.5">{match.staminaAtEnd} <span className="text-xs text-zinc-500 font-normal">/ 10</span></div>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Molestia Rodillas</div>
                        <div className={`text-base font-black mt-0.5 ${match.kneeDiscomfort >= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {match.kneeDiscomfort} <span className="text-xs text-zinc-500 font-normal">/ 5</span>
                        </div>
                      </div>
                    </div>

                    {/* Player Personal Notes */}
                    {match.userNotes && (
                      <div className="text-xs text-zinc-400 bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 italic">
                        "{match.userNotes}"
                      </div>
                    )}

                    {/* AI Debrief Section */}
                    {match.aiDebrief ? (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <Sparkles className="w-4 h-4" />
                            Análisis Técnico & Fisiológico (120kg Profile)
                          </span>
                          <button
                            onClick={() => handleRegenerateDebrief(match)}
                            disabled={isGeneratingDebrief === match.id}
                            className="text-xs text-zinc-400 hover:text-emerald-400 underline"
                          >
                            {isGeneratingDebrief === match.id ? 'Analizando...' : 'Recalcular con AI'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                            <div className="font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-emerald-400" />
                              Desempeño Táctico
                            </div>
                            <p className="text-zinc-400 leading-relaxed">{match.aiDebrief.tacticalSummary}</p>
                          </div>

                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                            <div className="font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                              <AlertTriangle className={`w-3.5 h-3.5 ${match.kneeDiscomfort >= 3 ? 'text-amber-400' : 'text-emerald-400'}`} />
                              Carga Física & Articular (Rodillas)
                            </div>
                            <p className="text-zinc-400 leading-relaxed">{match.aiDebrief.physicalAssessment}</p>
                          </div>

                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                            <div className="font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              Nutrición Post-Partido
                            </div>
                            <p className="text-zinc-400 leading-relaxed">{match.aiDebrief.nutritionTip}</p>
                          </div>

                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                            <div className="font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-cyan-400" />
                              Enfoque para el Próximo Partido
                            </div>
                            <p className="text-zinc-400 leading-relaxed">{match.aiDebrief.nextMatchFocus}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Sin informe detallado todavía</span>
                        <button
                          onClick={() => handleRegenerateDebrief(match)}
                          disabled={isGeneratingDebrief === match.id}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                        >
                          {isGeneratingDebrief === match.id ? 'Generando...' : 'Generar Análisis AI'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Match Modal */}
      {isOpenNewMatchModal && (
        <NewMatchModal
          profile={profile}
          onClose={onCloseNewMatchModal}
          onSave={(newMatch) => {
            onAddMatch(newMatch);
            onCloseNewMatchModal();
          }}
        />
      )}
    </div>
  );
};

// Sub-component: New Match Evaluation Modal
interface NewMatchModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (match: MatchRecord) => void;
}

const NewMatchModal: React.FC<NewMatchModalProps> = ({ profile, onClose, onSave }) => {
  const [matchType, setMatchType] = useState<MatchType>('futsal');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [position, setPosition] = useState(profile.preferredPositionFutsal);
  const [result, setResult] = useState<'win' | 'draw' | 'loss'>('win');
  const [scoreOwn, setScoreOwn] = useState(4);
  const [scoreRival, setScoreRival] = useState(2);
  const [minutesPlayed, setMinutesPlayed] = useState(30);

  // Technical
  const [goals, setGoals] = useState(1);
  const [assists, setAssists] = useState(1);
  const [shotsOnTarget, setShotsOnTarget] = useState(3);
  const [keyPasses, setKeyPasses] = useState(2);
  const [ballsRecovered, setBallsRecovered] = useState(4);
  const [duelsWon, setDuelsWon] = useState(5);
  const [duelsLost, setDuelsLost] = useState(2);

  // Physical & Joint
  const [staminaAtEnd, setStaminaAtEnd] = useState(7);
  const [kneeDiscomfort, setKneeDiscomfort] = useState(2);
  const [perceivedExertionRPE, setPerceivedExertionRPE] = useState(8);
  const [userNotes, setUserNotes] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Live estimated rating
  const currentCalculatedRating = calculateMatchRating({
    type: matchType,
    result,
    goals,
    assists,
    shotsOnTarget,
    keyPasses,
    ballsRecovered,
    duelsWon,
    duelsLost,
    minutesPlayed,
    staminaAtEnd,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAI(true);

    const matchPayload: MatchRecord = {
      id: `match-${Date.now()}`,
      date,
      title: title || (matchType === 'futsal' ? 'Partido de Fútbol Sala' : 'Partido de Fútbol 9'),
      type: matchType,
      position,
      result,
      scoreOwn,
      scoreRival,
      minutesPlayed,
      goals,
      assists,
      shotsOnTarget,
      keyPasses,
      ballsRecovered,
      duelsWon,
      duelsLost,
      staminaAtEnd,
      kneeDiscomfort,
      perceivedExertionRPE,
      overallMatchRating: currentCalculatedRating,
      userNotes,
    };

    try {
      // Generate instant AI analysis
      const debrief = await geminiService.analyzeMatch(matchPayload, profile);
      matchPayload.aiDebrief = debrief;
    } catch {
      // offline fallback will handle
    } finally {
      setIsLoadingAI(false);
      onSave(matchPayload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border-0 sm:border sm:border-zinc-800 rounded-none sm:rounded-2xl w-full max-w-2xl my-0 sm:my-8 overflow-hidden shadow-2xl flex flex-col h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              Evaluar Partido
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              Estadísticas y sensaciones de rodilla a 120kg
            </p>
          </div>

          {/* Live Rating Preview & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase hidden sm:inline">Nota:</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                {currentCalculatedRating.toFixed(1)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Formato de Fútbol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMatchType('futsal');
                  setPosition('Pívot');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  matchType === 'futsal'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-sm">⚽ Fútbol Sala (5v5)</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Pista dura, cambios de ritmo, pivotajes</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatchType('futbol9');
                  setPosition('Delantero Centro');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  matchType === 'futbol9'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-sm">🌱 Fútbol 9</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Césped sintético, distancias medias, duelos</div>
              </button>
            </div>
          </div>

          {/* Match Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1">Nombre / Rival</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Torneo vs Los Amigos"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1">Posición Jugada</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {matchType === 'futsal' ? (
                  <>
                    <option value="Pívot">Pívot (Referencia de ataque)</option>
                    <option value="Cierre">Cierre (Organizador defensivo)</option>
                    <option value="Ala">Ala (Banda / Transición)</option>
                    <option value="Portero-Jugador">Portero / Portero-Jugador</option>
                  </>
                ) : (
                  <>
                    <option value="Delantero Centro">Delantero Centro (Fijador)</option>
                    <option value="Defensa Central">Defensa Central</option>
                    <option value="Mediocentro Defensivo">Mediocentro Defensivo</option>
                    <option value="Lateral / Carrilero">Lateral / Carrilero</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Result & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1">Resultado</label>
              <div className="flex gap-1">
                {(['win', 'draw', 'loss'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResult(r)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded capitalize ${
                      result === r
                        ? r === 'win'
                          ? 'bg-emerald-500 text-zinc-950'
                          : r === 'draw'
                          ? 'bg-zinc-700 text-white'
                          : 'bg-rose-500 text-white'
                        : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {r === 'win' ? 'Victoria' : r === 'draw' ? 'Empate' : 'Derrota'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1">Goles Equipo</label>
              <input
                type="number"
                min="0"
                value={scoreOwn}
                onChange={(e) => setScoreOwn(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1">Goles Rival</label>
              <input
                type="number"
                min="0"
                value={scoreRival}
                onChange={(e) => setScoreRival(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm text-white"
              />
            </div>
          </div>

          {/* Technical Stats */}
          <div>
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Estadísticas Técnicas
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">⚽ Tus Goles</label>
                <input
                  type="number"
                  min="0"
                  value={goals}
                  onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">🎯 Asistencias</label>
                <input
                  type="number"
                  min="0"
                  value={assists}
                  onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">🥅 Tiros a Puerta</label>
                <input
                  type="number"
                  min="0"
                  value={shotsOnTarget}
                  onChange={(e) => setShotsOnTarget(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">🛡️ Balones Recuperados</label>
                <input
                  type="number"
                  min="0"
                  value={ballsRecovered}
                  onChange={(e) => setBallsRecovered(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">💪 Duelos Ganados</label>
                <input
                  type="number"
                  min="0"
                  value={duelsWon}
                  onChange={(e) => setDuelsWon(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">❌ Duelos Perdidos</label>
                <input
                  type="number"
                  min="0"
                  value={duelsLost}
                  onChange={(e) => setDuelsLost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">⏱️ Minutos Jugados</label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={minutesPlayed}
                  onChange={(e) => setMinutesPlayed(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">👟 Pases Clave</label>
                <input
                  type="number"
                  min="0"
                  value={keyPasses}
                  onChange={(e) => setKeyPasses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Physical & Knee Metrics (Key for 120kg profile) */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Desgaste Físico & Salud de Rodillas (120kg)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Resistencia al Final:</span>
                  <strong className="text-white">{staminaAtEnd}/10</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={staminaAtEnd}
                  onChange={(e) => setStaminaAtEnd(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-zinc-500 block">
                  {staminaAtEnd <= 4 ? 'Agotamiento extremo' : staminaAtEnd <= 7 ? 'Cansancio moderado' : 'Excelente energía'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Molestia en Rodillas:</span>
                  <strong className={kneeDiscomfort >= 3 ? 'text-rose-400' : 'text-emerald-400'}>
                    {kneeDiscomfort}/5
                  </strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={kneeDiscomfort}
                  onChange={(e) => setKneeDiscomfort(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-zinc-500 block">
                  {kneeDiscomfort === 1 ? 'Sin dolor' : kneeDiscomfort <= 3 ? 'Carga tolerable' : 'Dolor o inflamación aguda'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Esfuerzo Percibido (RPE):</span>
                  <strong className="text-white">{perceivedExertionRPE}/10</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={perceivedExertionRPE}
                  onChange={(e) => setPerceivedExertionRPE(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Escala de Borg de intensidad
                </span>
              </div>
            </div>
          </div>

          {/* User Notes */}
          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1">
              Notas Personales de Rendimiento
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={2}
              placeholder="Ej. Me sentí fuerte aguantando a los centrales de espaldas. En la segunda parte bajó mi repliegue..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoadingAI}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoadingAI ? 'Calculando & Analizando AI...' : 'Guardar y Generar Informe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
