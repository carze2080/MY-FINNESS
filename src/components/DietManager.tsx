import React, { useState } from 'react';
import { UserProfile, MealItem, RecipePreset } from '../types';
import { recipePresets } from '../data/initialData';
import { PantryRecipeGenerator } from './PantryRecipeGenerator';
import { 
  Utensils, 
  Flame, 
  Droplets, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Coffee, 
  Sun, 
  Zap, 
  Moon, 
  Apple,
  Info,
  ChefHat
} from 'lucide-react';

interface DietManagerProps {
  profile: UserProfile;
  meals: MealItem[];
  waterToday: number;
  dayType: 'match_day' | 'training_day' | 'rest_day';
  onSetDayType: (type: 'match_day' | 'training_day' | 'rest_day') => void;
  onAddMeal: (meal: MealItem) => void;
  onDeleteMeal: (id: string) => void;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
}

export const DietManager: React.FC<DietManagerProps> = ({
  profile,
  meals,
  waterToday,
  dayType,
  onSetDayType,
  onAddMeal,
  onDeleteMeal,
  onAddWater,
  onResetWater,
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [activeDietTab, setActiveDietTab] = useState<'pantry_chef' | 'meals_log' | 'presets_guide'>('pantry_chef');
  const [selectedMealType, setSelectedMealType] = useState<MealItem['mealType']>('lunch');
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState(450);
  const [customProtein, setCustomProtein] = useState(35);
  const [customCarbs, setCustomCarbs] = useState(45);
  const [customFats, setCustomFats] = useState(12);
  const [customAntiInflammatory, setCustomAntiInflammatory] = useState(false);

  // Targets by day type
  const targetCalories =
    dayType === 'match_day'
      ? profile.calorieTarget.matchDay
      : dayType === 'training_day'
      ? profile.calorieTarget.trainingDay
      : profile.calorieTarget.restDay;

  // Approximate macro targets for 120kg athlete in deficit:
  // Protein: ~180g (1.5-1.6g/kg or 2.0g/kg lean mass)
  const targetProtein = 180;
  // Carbs: 280g on match day, 200g on training, 140g on rest
  const targetCarbs = dayType === 'match_day' ? 280 : dayType === 'training_day' ? 210 : 140;
  // Fats: ~65-75g
  const targetFats = 70;

  // Totals consumed today
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.proteinG, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbsG, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fatsG, 0);

  const remainingCalories = targetCalories - totalCalories;

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newMeal: MealItem = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mealType: selectedMealType,
      name: customName.trim(),
      calories: customCalories,
      proteinG: customProtein,
      carbsG: customCarbs,
      fatsG: customFats,
      isAntiInflammatory: customAntiInflammatory,
    };

    onAddMeal(newMeal);
    setCustomName('');
    setIsAddingCustom(false);
  };

  const handleAddPreset = (preset: RecipePreset) => {
    const newMeal: MealItem = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mealType: preset.mealType,
      name: preset.title,
      calories: preset.calories,
      proteinG: preset.proteinG,
      carbsG: preset.carbsG,
      fatsG: preset.fatsG,
      isAntiInflammatory: preset.isAntiInflammatory,
    };
    onAddMeal(newMeal);
  };

  const getMealIcon = (type: MealItem['mealType']) => {
    switch (type) {
      case 'breakfast': return Coffee;
      case 'lunch': return Sun;
      case 'pre_match': return Zap;
      case 'post_match': return Sparkles;
      case 'dinner': return Moon;
      default: return Apple;
    }
  };

  const getMealLabel = (type: MealItem['mealType']) => {
    switch (type) {
      case 'breakfast': return 'Desayuno';
      case 'lunch': return 'Almuerzo';
      case 'pre_match': return 'Pre-Partido (Combustible)';
      case 'post_match': return 'Post-Partido (Regeneración)';
      case 'dinner': return 'Cena';
      default: return 'Snack / Merienda';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Protocol Explanation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Nutrición Deportiva Personalizada
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Ciclo de Carbohidratos para 120kg</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Gestión de Dieta & Déficit Seguro
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Un déficit drástico te dejaría sin fuerza a los 10 minutos de juego y aumentaría el riesgo de lesión ligamentosa. Tu plan cicla nutrientes: más energía en días de partido y déficit limpio en descanso.
            </p>
          </div>

          {/* Interactive Day Type Segmented Buttons */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 shrink-0">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">Tipo de Día Actual:</div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => onSetDayType('match_day')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  dayType === 'match_day'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                ⚽ Día de Partido ({profile.calorieTarget.matchDay} kcal)
              </button>
              <button
                onClick={() => onSetDayType('training_day')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  dayType === 'training_day'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                🏋️ Día de Fuerza ({profile.calorieTarget.trainingDay} kcal)
              </button>
              <button
                onClick={() => onSetDayType('rest_day')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  dayType === 'rest_day'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                🛌 Descanso ({profile.calorieTarget.restDay} kcal)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calories & Macros Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Main Calorie Gauge */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase text-zinc-400 mb-1 sm:mb-2">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                Calorías
              </span>
              <span className="text-zinc-500 font-mono text-[10px] sm:text-xs">/{targetCalories}</span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalCalories}</span>
              <span className="text-[10px] sm:text-xs text-zinc-400">kcal</span>
            </div>
            <div className="text-[10px] sm:text-xs mt-1 text-emerald-400 font-medium truncate">
              {remainingCalories >= 0 ? `${remainingCalories} kcal libres` : `${Math.abs(remainingCalories)} kcal +`}
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3 overflow-hidden">
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  totalCalories > targetCalories ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-800 truncate">
            {dayType === 'match_day' ? 'Carga Pre-Partido' : 'Déficit Seguro'}
          </div>
        </div>

        {/* Protein Target */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase text-zinc-400 mb-1 sm:mb-2">
              <span>Proteínas</span>
              <span className="font-mono text-zinc-500 text-[10px] sm:text-xs">/{targetProtein}g</span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalProtein}g</span>
              <span className="text-[10px] sm:text-xs text-zinc-400">({Math.round((totalProtein * 4 / Math.max(1, totalCalories)) * 100)}%)</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-800 truncate">
            Mantiene masa muscular
          </div>
        </div>

        {/* Carbs Target */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase text-zinc-400 mb-1 sm:mb-2">
              <span>Carbohidratos</span>
              <span className="font-mono text-zinc-500 text-[10px] sm:text-xs">/{targetCarbs}g</span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalCarbs}g</span>
              <span className="text-[10px] sm:text-xs text-zinc-400">({Math.round((totalCarbs * 4 / Math.max(1, totalCalories)) * 100)}%)</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-800 truncate">
            {dayType === 'match_day' ? 'Energía para correr' : 'Gasto controlado'}
          </div>
        </div>

        {/* Fats Target */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase text-zinc-400 mb-1 sm:mb-2">
              <span>Grasas</span>
              <span className="font-mono text-zinc-500 text-[10px] sm:text-xs">/{targetFats}g</span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalFats}g</span>
              <span className="text-[10px] sm:text-xs text-zinc-400">({Math.round((totalFats * 9 / Math.max(1, totalCalories)) * 100)}%)</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalFats / targetFats) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-800 truncate">
            Omega-3 antiinflamatorio
          </div>
        </div>
      </div>

      {/* Hydration Section (Crucial at 120kg) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Hidratación & Lubricación Articular: {(waterToday / 1000).toFixed(2)} L
              </h2>
              <p className="text-xs text-zinc-400">
                Meta diaria recomendada: {profile.waterGoalLiters} Litros (Indispensable para evitar calambres y proteger la rodilla a 120kg).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddWater(250)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
            >
              +250 ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
            >
              +500 ml
            </button>
            <button
              onClick={() => onAddWater(750)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
            >
              +750 ml
            </button>
            <button
              onClick={onResetWater}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              title="Reiniciar a 0 ml"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Water Progress bar */}
        <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-800">
          <div
            className="bg-cyan-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (waterToday / (profile.waterGoalLiters * 1000)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Sub-navigation Tabs within Diet Manager */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3 pt-1">
        <button
          onClick={() => setActiveDietTab('pantry_chef')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeDietTab === 'pantry_chef'
              ? 'bg-emerald-500 text-zinc-950 shadow-md scale-[1.01]'
              : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>🍳 Chef con lo que tengo en casa</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
            activeDietTab === 'pantry_chef' ? 'bg-zinc-950/25 text-zinc-950' : 'bg-emerald-500/15 text-emerald-400'
          }`}>
            Nuevo
          </span>
        </button>

        <button
          onClick={() => setActiveDietTab('meals_log')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeDietTab === 'meals_log'
              ? 'bg-emerald-500 text-zinc-950 shadow-md scale-[1.01]'
              : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Mis Comidas de Hoy ({meals.length})</span>
        </button>

        <button
          onClick={() => setActiveDietTab('presets_guide')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeDietTab === 'presets_guide'
              ? 'bg-emerald-500 text-zinc-950 shadow-md scale-[1.01]'
              : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Recetas Rápidas & Rodillas</span>
        </button>
      </div>

      {/* Tab 1: Pantry Recipe Generator */}
      {activeDietTab === 'pantry_chef' && (
        <div className="space-y-6">
          <PantryRecipeGenerator profile={profile} onAddMeal={onAddMeal} />

          {/* Quick Summary of Logged Meals */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 font-bold">
                {meals.length}
              </div>
              <div>
                <span className="font-bold text-white">Comidas registradas hoy ({totalCalories} kcal consumidas)</span>
                <p className="text-zinc-400 text-[11px]">
                  {remainingCalories >= 0
                    ? `Te quedan ${remainingCalories} kcal para tu meta diaria de ${dayType === 'match_day' ? 'partido' : 'déficit'}.`
                    : `Superaste la meta en ${Math.abs(remainingCalories)} kcal.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveDietTab('meals_log')}
              className="text-emerald-400 font-bold hover:underline self-start sm:self-center text-xs"
            >
              Ver registro detallado de hoy →
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Logged Meals List & Custom Form */}
      {activeDietTab === 'meals_log' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Logged Meals for Today (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                Comidas Registradas Hoy ({meals.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDietTab('pantry_chef')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors hidden sm:flex items-center gap-1"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Chef con mis Ingredientes</span>
                </button>
                <button
                  onClick={() => setIsAddingCustom(!isAddingCustom)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Manual</span>
                </button>
              </div>
            </div>

            {/* Custom Meal Form (Expandable) */}
            {isAddingCustom && (
              <form onSubmit={handleAddCustomMeal} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Registrar Comida Personalizada
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Nombre del Plato / Alimento</label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ej. Arroz con ternera magra y aguacate"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Tipo de Comida</label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="breakfast">Desayuno</option>
                      <option value="lunch">Almuerzo</option>
                      <option value="pre_match">Pre-Partido (2-3h antes)</option>
                      <option value="post_match">Post-Partido (Recuperación)</option>
                      <option value="dinner">Cena</option>
                      <option value="snack">Snack / Media Tarde</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Calorías (kcal)</label>
                    <input
                      type="number"
                      min="0"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Proteína (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Carbohidratos (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Grasas (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={customFats}
                      onChange={(e) => setCustomFats(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="antiInflammatoryCheck"
                    checked={customAntiInflammatory}
                    onChange={(e) => setCustomAntiInflammatory(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <label htmlFor="antiInflammatoryCheck" className="text-xs text-zinc-300">
                    Es un alimento protector articular / antiinflamatorio (cúrcuma, omega-3, frutos rojos, colágeno)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-800 text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                  >
                    Guardar Comida
                  </button>
                </div>
              </form>
            )}

            {/* Meals Cards */}
            <div className="space-y-3">
              {meals.length === 0 ? (
                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-zinc-500 text-xs space-y-3">
                  <p>No hay comidas registradas para hoy.</p>
                  <button
                    onClick={() => setActiveDietTab('pantry_chef')}
                    className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Crear receta con mis ingredientes</span>
                  </button>
                </div>
              ) : (
                meals.map((meal) => {
                  const Icon = getMealIcon(meal.mealType);
                  return (
                    <div
                      key={meal.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                              {getMealLabel(meal.mealType)}
                            </span>
                            {meal.isAntiInflammatory && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                🛡️ Antiinflamatorio
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">{meal.name}</h4>
                          <div className="text-xs text-zinc-400 mt-0.5 space-x-2">
                            <span className="font-semibold text-zinc-200">{meal.calories} kcal</span>
                            <span>·</span>
                            <span>P: {meal.proteinG}g</span>
                            <span>·</span>
                            <span>C: {meal.carbsG}g</span>
                            <span>·</span>
                            <span>G: {meal.fatsG}g</span>
                          </div>
                          {meal.notes && (
                            <p className="text-[11px] text-zinc-500 mt-1 italic">{meal.notes}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteMeal(meal.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Eliminar comida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Presets & Anti-Inflammatory Guide (1 col) */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Recetas Rápidas
                </h3>
                <span className="text-[11px] text-zinc-500">1-click</span>
              </div>

              <div className="space-y-2.5">
                {recipePresets.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-zinc-200 leading-snug">{recipe.title}</span>
                      <button
                        onClick={() => handleAddPreset(recipe)}
                        className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 shrink-0"
                      >
                        + Añadir
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400">{recipe.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                      <span className="text-emerald-400 font-semibold">{recipe.calories} kcal</span>
                      <span>P: {recipe.proteinG}g · C: {recipe.carbsG}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Joint Nutrition Guide Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Nutrientes para Proteger Rodillas a 120kg
              </h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span><strong>Colágeno + Vitamina C:</strong> Gelatina pura o caldo de huesos con limón 45 min antes de entrenar estimula la síntesis de cartílago.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span><strong>Omega-3 (Salmón, atún, nueces):</strong> Reduce la citoquina inflamatoria tras el impacto en la pista dura de sala.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span><strong>Cúrcuma y Jengibre:</strong> Potentes inhibidores naturales de la inflamación rotuliana.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Presets & Joint Guide Dedicated View */}
      {activeDietTab === 'presets_guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Recetas Futboleras Predefinidas (1-clic)
            </h3>
            <div className="space-y-3">
              {recipePresets.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                        {recipe.bestTiming}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{recipe.title}</h4>
                    </div>
                    <button
                      onClick={() => handleAddPreset(recipe)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shrink-0 shadow-sm"
                    >
                      + Registrar
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300">{recipe.description}</p>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800/80 text-[11px] text-emerald-300">
                    💡 <strong>Beneficio:</strong> {recipe.keyBenefit}
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-900">
                    <span className="text-amber-400 font-bold">{recipe.calories} kcal</span>
                    <span>P: {recipe.proteinG}g · C: {recipe.carbsG}g · G: {recipe.fatsG}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Guía Articular: Protección para Rodillas a 120kg
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Al jugar fútbol sala (pista dura) y F9 con 120kg de peso corporal, la nutrición antiinflamatoria acelera la recuperación del cartílago rotuliano y los meniscos:
              </p>
              <ul className="text-xs text-zinc-300 space-y-3">
                <li className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-emerald-400 mb-1">1. Protocolo Colágeno + Cítrico</div>
                  <p className="text-zinc-400">
                    Toma 10g de gelatina neutra o colágeno hidrolizado con jugo de naranja o limón 45 minutos antes de la sesión de fuerza isométrica. Estimula el flujo sinovial hacia el tendón rotuliano.
                  </p>
                </li>
                <li className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-cyan-400 mb-1">2. Ácidos Grasos Omega-3</div>
                  <p className="text-zinc-400">
                    Atún, salmón o nueces tras los partidos contrarrestan las citoquinas inflamatorias provocadas por las desaceleraciones bruscas en sala.
                  </p>
                </li>
                <li className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-amber-400 mb-1">3. Cúrcuma con Pimienta Negra</div>
                  <p className="text-zinc-400">
                    La curcumina reduce el dolor articular similar al ibuprofeno sin irritar la mucosa gástrica antes de un partido.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
