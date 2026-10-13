import React, { useState } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { 
  TrendingDown, 
  Plus, 
  ShieldCheck, 
  Calendar, 
  Scale, 
  ArrowDownRight, 
  HeartPulse,
  Activity
} from 'lucide-react';

interface WeightProgressProps {
  profile: UserProfile;
  weightEntries: WeightEntry[];
  onAddWeightEntry: (entry: WeightEntry) => void;
  onUpdateTargetWeight: (targetKg: number) => void;
}

export const WeightProgress: React.FC<WeightProgressProps> = ({
  profile,
  weightEntries,
  onAddWeightEntry,
  onUpdateTargetWeight,
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.currentWeightKg);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [kneeSensation, setKneeSensation] = useState<WeightEntry['kneeSensation']>('Normal');
  const [notes, setNotes] = useState('');

  const sortedEntries = [...weightEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const initialWeight = sortedEntries[sortedEntries.length - 1]?.weightKg || profile.currentWeightKg;
  const latestWeight = sortedEntries[0]?.weightKg || profile.currentWeightKg;
  const totalChangeKg = latestWeight - initialWeight;
  const isLoss = totalChangeKg <= 0;

  // Biomechanical physics calculation:
  // Each 1kg lost relieves approximately 4kg of compressive force across the patellofemoral joint during deceleration
  const totalKneePressureRelievedKg = Math.abs(totalChangeKg) * 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WeightEntry = {
      id: `weight-${Date.now()}`,
      date: newDate,
      weightKg: Number(newWeight),
      kneeSensation,
      notes: notes.trim(),
    };
    onAddWeightEntry(entry);
    setIsLogging(false);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Biomechanical Joint Decompression Callout */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Evolución Física & Salud Articular
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Objetivo Saludable: 95 kg</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Control de Peso & Descompresión de Rodillas
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              En la cancha de fútbol sala y fútbol 9, cada kilo menos se traduce en mayor velocidad de arranque, menos fatiga en el segundo tiempo y menor impacto en tus cartílagos.
            </p>
          </div>

          <button
            onClick={() => setIsLogging(!isLogging)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Peso</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Current Weight */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              Peso Actual
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">30 años</span>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{latestWeight.toFixed(1)}</span>
            <span className="text-sm text-zinc-400 font-medium">kg</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1.5 sm:mt-2 flex items-center gap-1">
            <span className={isLoss ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {isLoss ? `${totalChangeKg.toFixed(1)} kg` : `+${totalChangeKg.toFixed(1)} kg`}
            </span>
            <span className="truncate">desde el inicio ({initialWeight} kg)</span>
          </div>
        </div>

        {/* Biomechanical Knee Relief */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Presión Liberada en Rodilla
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              -{totalKneePressureRelievedKg.toFixed(1)}
            </span>
            <span className="text-sm text-zinc-400 font-medium">kg por pisada</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1.5 sm:mt-2">
            En frenadas y giros de sala y fútbol 9.
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Meta Objetivo</span>
            <span className="text-emerald-400 font-mono">{profile.targetWeightKg} kg</span>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {(latestWeight - profile.targetWeightKg).toFixed(1)}
            </span>
            <span className="text-sm text-zinc-400 font-medium">kg para la meta</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 sm:mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.max(5, Math.min(100, ((initialWeight - latestWeight) / (initialWeight - profile.targetWeightKg)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Log Weight Form (Expandable) */}
      {isLogging && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Registrar Pesaje & Estado de Articulaciones
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Peso Corporal (kg)</label>
              <input
                type="number"
                step="0.1"
                min="70"
                max="160"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Sensación en Rodillas</label>
              <select
                value={kneeSensation}
                onChange={(e) => setKneeSensation(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Excelente">Excelente (Cero dolor)</option>
                <option value="Normal">Normal (Sin quejas)</option>
                <option value="Cargada">Cargada / Sobrecarga leve</option>
                <option value="Dolor">Dolor / Inflamación</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Notas / Sensaciones en Cancha</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Me sentí más rápido en el repliegue defensivo de sala."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsLogging(false)}
              className="px-3 py-1.5 text-xs rounded bg-zinc-800 text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            >
              Guardar Pesaje
            </button>
          </div>
        </form>
      )}

      {/* History Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Historial de Pesajes & Sensaciones de Rodilla
          </h3>
          <span className="text-xs text-zinc-500">{sortedEntries.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Peso</th>
                <th className="py-3 px-4">Diferencia</th>
                <th className="py-3 px-4">Estado Articular</th>
                <th className="py-3 px-4">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {sortedEntries.map((entry, idx) => {
                const prev = sortedEntries[idx + 1];
                const diff = prev ? entry.weightKg - prev.weightKg : 0;
                return (
                  <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400">{entry.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{entry.weightKg.toFixed(1)} kg</td>
                    <td className="py-3 px-4">
                      {prev ? (
                        <span className={`font-semibold ${diff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {diff <= 0 ? `${diff.toFixed(1)} kg` : `+${diff.toFixed(1)} kg`}
                        </span>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          entry.kneeSensation === 'Excelente'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : entry.kneeSensation === 'Normal'
                            ? 'bg-zinc-800 text-zinc-300'
                            : entry.kneeSensation === 'Cargada'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        {entry.kneeSensation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 italic max-w-xs truncate">
                      {entry.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
