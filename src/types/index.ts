export type MatchType = 'futsal' | 'futbol9';

export type DayType = 'match_day' | 'training_day' | 'rest_day';

export interface UserProfile {
  name: string;
  age: number; // 30
  currentWeightKg: number; // ~120
  targetWeightKg: number; // e.g. 95
  heightCm: number; // e.g. 180
  preferredPositionFutsal: string; // e.g. 'Pívot'
  preferredPositionF9: string; // e.g. 'Delantero Centro'
  futsalMatchesPerWeek: number;
  f9MatchesPerWeek: number;
  waterGoalLiters: number;
  calorieTarget: {
    matchDay: number;
    trainingDay: number;
    restDay: number;
  };
}

export interface MatchDebrief {
  tacticalSummary: string;
  physicalAssessment: string;
  nutritionTip: string;
  nextMatchFocus: string;
}

export interface MatchRecord {
  id: string;
  date: string;
  title: string;
  type: MatchType;
  position: string;
  result: 'win' | 'draw' | 'loss';
  scoreOwn: number;
  scoreRival: number;
  minutesPlayed: number;
  // Technical Stats
  goals: number;
  assists: number;
  shotsOnTarget: number;
  keyPasses: number;
  ballsRecovered: number;
  duelsWon: number;
  duelsLost: number;
  // Physical & Joint Metrics (Crucial for 120kg profile)
  staminaAtEnd: number; // 1 to 10
  kneeDiscomfort: number; // 1 (sin dolor) to 5 (fuerte molestia)
  perceivedExertionRPE: number; // 1 to 10
  overallMatchRating: number; // 1.0 to 10.0
  userNotes?: string;
  aiDebrief?: MatchDebrief;
}

export type ExerciseAnimationType = 
  | 'wall_sit' 
  | 'chair_squat' 
  | 'glute_bridge' 
  | 'calf_raise' 
  | 'bird_dog' 
  | 'plank' 
  | 'futsal_footwork' 
  | 'step_up' 
  | 'hip_mobility' 
  | 'tibialis_raise' 
  | 'legs_up_wall';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repsOrTime: string;
  restSec: number;
  focusMuscle: string;
  jointSafetyTip: string; // Ex: "No sobrepases 90º de flexión para no estresar el tendón rotuliano con 120kg"
  instructions: string[];
  animationType: ExerciseAnimationType;
  equipmentNeeded: string; // e.g. "Ninguno (Solo pared)" or "Ninguno (Silla estable)"
}

export interface Routine {
  id: string;
  title: string;
  category: 'knee_prehab' | 'futsal_cardio' | 'f9_stamina' | 'functional_strength' | 'post_match_recovery' | 'match_activation';
  categoryLabel: string;
  durationMin: number;
  difficulty: 'Baja' | 'Media' | 'Alta';
  jointImpactLevel: 'Cero Impacto' | 'Bajo Impacto' | 'Impacto Controlado';
  targetGoal: string;
  description: string;
  exercises: Exercise[];
}

export interface MealItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'pre_match' | 'post_match' | 'dinner' | 'snack';
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  isAntiInflammatory: boolean;
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  kneeSensation: 'Excelente' | 'Normal' | 'Cargada' | 'Dolor';
  notes?: string;
}

export interface RecipePreset {
  id: string;
  title: string;
  mealType: 'breakfast' | 'lunch' | 'pre_match' | 'post_match' | 'dinner' | 'snack';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  description: string;
  bestTiming: string;
  keyBenefit: string;
  isAntiInflammatory: boolean;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  mealType: 'breakfast' | 'lunch' | 'pre_match' | 'post_match' | 'dinner' | 'snack';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  prepTimeMinutes: number;
  ingredientsUsed: string[];
  steps: string[];
  footballBenefit: string;
  isAntiInflammatory: boolean;
}

