import React, { useState } from 'react';
import { UserProfile, MealItem, GeneratedRecipe } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  Sparkles, 
  ChefHat, 
  Plus, 
  X, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Check, 
  Utensils, 
  Zap, 
  RefreshCw,
  ShoppingBag,
  Info
} from 'lucide-react';

interface PantryRecipeGeneratorProps {
  profile: UserProfile;
  onAddMeal: (meal: MealItem) => void;
}

const COMMON_INGREDIENTS = [
  { name: 'Huevos', category: 'Proteína' },
  { name: 'Pechuga de pollo', category: 'Proteína' },
  { name: 'Atún en lata', category: 'Proteína' },
  { name: 'Carne molida/magra', category: 'Proteína' },
  { name: 'Queso fresco / Panela', category: 'Proteína' },
  { name: 'Arroz blanco', category: 'Carbohidrato' },
  { name: 'Avena', category: 'Carbohidrato' },
  { name: 'Papa / Patata', category: 'Carbohidrato' },
  { name: 'Pasta', category: 'Carbohidrato' },
  { name: 'Plátano / Banana', category: 'Carbohidrato' },
  { name: 'Pan integral', category: 'Carbohidrato' },
  { name: 'Tomate', category: 'Vegetal' },
  { name: 'Cebolla', category: 'Vegetal' },
  { name: 'Espinacas', category: 'Vegetal' },
  { name: 'Ajo', category: 'Vegetal' },
  { name: 'Pimiento', category: 'Vegetal' },
  { name: 'Zanahoria', category: 'Vegetal' },
  { name: 'Aguacate / Palta', category: 'Grasa saludable' },
  { name: 'Aceite de oliva', category: 'Grasa saludable' },
  { name: 'Cúrcuma / Pimienta', category: 'Condimento' },
];

export const PantryRecipeGenerator: React.FC<PantryRecipeGeneratorProps> = ({
  profile,
  onAddMeal,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'Huevos',
    'Arroz blanco',
    'Tomate',
    'Cebolla'
  ]);
  const [customInput, setCustomInput] = useState('');
  const [mealGoal, setMealGoal] = useState<string>('Almuerzo / Cena Saciante (Control calórico a 120kg)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [addedRecipeIds, setAddedRecipeIds] = useState<Record<string, boolean>>({});

  const toggleIngredient = (name: string) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selectedIngredients.includes(trimmed)) {
      setSelectedIngredients([...selectedIngredients, trimmed]);
    }
    setCustomInput('');
  };

  const handleRemoveIngredient = (name: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
  };

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) return;
    setIsGenerating(true);

    try {
      const recipes = await geminiService.generateRecipesFromIngredients(
        selectedIngredients,
        mealGoal,
        profile
      );
      setGeneratedRecipes(recipes);
    } catch (err) {
      console.error('Error generating recipes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogRecipe = (recipe: GeneratedRecipe) => {
    const newMeal: MealItem = {
      id: `meal-${Date.now()}-${recipe.id}`,
      date: new Date().toISOString().split('T')[0],
      mealType: recipe.mealType,
      name: recipe.title,
      calories: recipe.calories,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatsG: recipe.fatsG,
      isAntiInflammatory: recipe.isAntiInflammatory,
      notes: `Preparada con: ${recipe.ingredientsUsed.join(', ')}`,
    };

    onAddMeal(newMeal);
    setAddedRecipeIds((prev) => ({ ...prev, [recipe.id]: true }));

    // Reset indicator after 4 seconds
    setTimeout(() => {
      setAddedRecipeIds((prev) => ({ ...prev, [recipe.id]: false }));
    }, 4000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ChefHat className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Chef con lo que tienes en casa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Recetas con tus Ingredientes Disponibles
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Dile a la app qué alimentos tienes hoy en tu nevera o despensa. Te creará recetas adaptadas a tus <strong>120kg</strong>: saciantes, con proteína para proteger tus piernas y digestión óptima para Fútbol Sala y Fútbol 9.
          </p>
        </div>

        {selectedIngredients.length > 0 && (
          <button
            onClick={() => setSelectedIngredients([])}
            className="text-xs text-zinc-500 hover:text-zinc-300 self-start sm:self-center transition-colors"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {/* Selected Ingredients Bar / Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
          <span>Ingredientes seleccionados ({selectedIngredients.length}):</span>
          <span className="text-[11px] text-zinc-500 font-normal">Toca para eliminar</span>
        </label>
        
        {selectedIngredients.length === 0 ? (
          <div className="p-3 bg-zinc-950 border border-dashed border-zinc-800 rounded-lg text-xs text-zinc-500 text-center">
            Selecciona ingredientes sugeridos abajo o escribe los que tengas en tu cocina.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-950 border border-zinc-800 rounded-lg min-h-[46px] items-center">
            {selectedIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn"
              >
                {item}
                <button
                  onClick={() => handleRemoveIngredient(item)}
                  className="hover:text-rose-400 transition-colors"
                  title="Quitar ingrediente"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom Input Form */}
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Escribe otro ingrediente (ej. calabacín, queso fresco, lentejas, pasta...)"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </form>

      {/* Quick Click Staple Ingredients */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>Ingredientes habituales en casa (Toca para agregar rápido):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_INGREDIENTS.map((item) => {
            const isSelected = selectedIngredients.includes(item.name);
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => toggleIngredient(item.name)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {isSelected ? `✓ ${item.name}` : `+ ${item.name}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Goal / Context Selector */}
      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <label className="text-xs font-bold text-zinc-300 block">
          ¿Para qué momento u objetivo buscas la receta?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              id: 'pre_match',
              label: '⚽ Pre-Partido (2-3h antes)',
              desc: 'Energía rápida sin pesadez ni reflujo para correr en sala/F9',
              text: 'Pre-Partido (Carbohidratos limpios y digestión rápida)',
            },
            {
              id: 'post_match',
              label: '🛡️ Post-Partido (Recuperación)',
              desc: 'Proteína muscular y antiinflamatorio para rodillas a 120kg',
              text: 'Post-Partido (Recuperación de piernas y tendones)',
            },
            {
              id: 'satiating_meal',
              label: '🥗 Almuerzo / Cena Saciante',
              desc: 'Volumen y saciedad para sostener el déficit seguro',
              text: 'Almuerzo / Cena Saciante (Control calórico a 120kg)',
            },
            {
              id: 'quick_breakfast',
              label: '☀️ Desayuno / Snack Rápido',
              desc: 'En menos de 10 minutos para arrancar con energía',
              text: 'Desayuno o Snack Rápido',
            },
          ].map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => setMealGoal(goal.text)}
              className={`p-3 text-left rounded-xl border transition-all ${
                mealGoal === goal.text
                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-bold text-white leading-snug">{goal.label}</div>
              <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{goal.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        <button
          onClick={handleGenerate}
          disabled={selectedIngredients.length === 0 || isGenerating}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Creando recetas deportivas con tus ingredientes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-zinc-950" />
              <span>Generar Recetas con mis Ingredientes ({selectedIngredients.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Recipes List */}
      {generatedRecipes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Recetas Creadas a tu Medida ({generatedRecipes.length})
            </h3>
            <span className="text-xs text-zinc-400 font-mono">120kg & Fútbol</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedRecipes.map((recipe) => {
              const isAdded = !!addedRecipeIds[recipe.id];
              return (
                <div
                  key={recipe.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Card Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                            {recipe.mealType === 'pre_match'
                              ? '⚽ Pre-Partido'
                              : recipe.mealType === 'post_match'
                              ? '🛡️ Post-Partido'
                              : recipe.mealType === 'dinner'
                              ? '🌙 Cena'
                              : recipe.mealType === 'breakfast'
                              ? '☕ Desayuno'
                              : '☀️ Almuerzo'}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            {recipe.prepTimeMinutes} min
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                          {recipe.title}
                        </h4>
                      </div>
                    </div>

                    {/* Football & Articular Benefit */}
                    {recipe.footballBenefit && (
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs text-emerald-300/90 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Beneficio en Cancha:</strong> {recipe.footballBenefit}</span>
                      </div>
                    )}

                    {/* Macro Breakdown */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                      <div>
                        <div className="text-[10px] uppercase text-zinc-500 font-bold">Calorías</div>
                        <div className="text-xs sm:text-sm font-black text-amber-400">{recipe.calories} kcal</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-500 font-bold">Proteína</div>
                        <div className="text-xs sm:text-sm font-black text-emerald-400">{recipe.proteinG}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-500 font-bold">Carbs</div>
                        <div className="text-xs sm:text-sm font-black text-cyan-400">{recipe.carbsG}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-500 font-bold">Grasas</div>
                        <div className="text-xs sm:text-sm font-black text-zinc-300">{recipe.fatsG}g</div>
                      </div>
                    </div>

                    {/* Ingredients Used */}
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-zinc-400">Ingredientes utilizados:</span>
                      <div className="text-zinc-300 flex flex-wrap gap-1">
                        {recipe.ingredientsUsed.map((ing, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preparation Steps */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-semibold text-zinc-400">Pasos de preparación:</span>
                      <ol className="text-xs text-zinc-300 space-y-1.5 pl-4 list-decimal marker:text-emerald-400">
                        {recipe.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Add to Daily Tracker Button */}
                  <div className="pt-2 border-t border-zinc-900">
                    <button
                      onClick={() => handleLogRecipe(recipe)}
                      disabled={isAdded}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-500 text-zinc-950 font-black'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Agregada a tus comidas de hoy!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Añadir a mi Registro de Hoy ({recipe.calories} kcal)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
