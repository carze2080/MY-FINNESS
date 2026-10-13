import { UserProfile, MatchRecord, Routine, MealItem, WeightEntry } from '../types';
import { initialProfile, initialMatches, initialRoutines, initialDayMeals, initialWeightEntries } from '../data/initialData';

const KEYS = {
  PROFILE: 'matchfit_profile_v1',
  MATCHES: 'matchfit_matches_v1',
  ROUTINES: 'matchfit_routines_v1',
  MEALS: 'matchfit_meals_v1',
  WEIGHTS: 'matchfit_weights_v1',
  WATER: 'matchfit_water_ml_v1',
  DAY_TYPE: 'matchfit_day_type_v1',
};

export const storageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : initialProfile;
    } catch {
      return initialProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getMatches(): MatchRecord[] {
    try {
      const data = localStorage.getItem(KEYS.MATCHES);
      return data ? JSON.parse(data) : initialMatches;
    } catch {
      return initialMatches;
    }
  },

  saveMatches(matches: MatchRecord[]): void {
    localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  },

  addMatch(match: MatchRecord): MatchRecord[] {
    const list = this.getMatches();
    const updated = [match, ...list];
    this.saveMatches(updated);
    return updated;
  },

  deleteMatch(id: string): MatchRecord[] {
    const list = this.getMatches();
    const updated = list.filter((m) => m.id !== id);
    this.saveMatches(updated);
    return updated;
  },

  getRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(KEYS.ROUTINES);
      if (!data) return initialRoutines;
      const parsed = JSON.parse(data);
      // Auto-upgrade if cached version was from previous gym-equipment version
      if (parsed.length > 0 && !parsed[0]?.exercises?.[0]?.animationType) {
        this.saveRoutines(initialRoutines);
        return initialRoutines;
      }
      return parsed;
    } catch {
      return initialRoutines;
    }
  },

  saveRoutines(routines: Routine[]): void {
    localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
  },

  getMeals(): MealItem[] {
    try {
      const data = localStorage.getItem(KEYS.MEALS);
      return data ? JSON.parse(data) : initialDayMeals;
    } catch {
      return initialDayMeals;
    }
  },

  saveMeals(meals: MealItem[]): void {
    localStorage.setItem(KEYS.MEALS, JSON.stringify(meals));
  },

  addMeal(meal: MealItem): MealItem[] {
    const list = this.getMeals();
    const updated = [meal, ...list];
    this.saveMeals(updated);
    return updated;
  },

  deleteMeal(id: string): MealItem[] {
    const list = this.getMeals();
    const updated = list.filter((m) => m.id !== id);
    this.saveMeals(updated);
    return updated;
  },

  getWeightEntries(): WeightEntry[] {
    try {
      const data = localStorage.getItem(KEYS.WEIGHTS);
      return data ? JSON.parse(data) : initialWeightEntries;
    } catch {
      return initialWeightEntries;
    }
  },

  saveWeightEntries(entries: WeightEntry[]): void {
    localStorage.setItem(KEYS.WEIGHTS, JSON.stringify(entries));
  },

  addWeightEntry(entry: WeightEntry): WeightEntry[] {
    const list = this.getWeightEntries();
    const updated = [...list, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.saveWeightEntries(updated);
    return updated;
  },

  getWaterToday(dateStr: string): number {
    try {
      const data = localStorage.getItem(`${KEYS.WATER}_${dateStr}`);
      return data ? parseInt(data, 10) : 1800;
    } catch {
      return 1800;
    }
  },

  setWaterToday(dateStr: string, ml: number): void {
    localStorage.setItem(`${KEYS.WATER}_${dateStr}`, ml.toString());
  },

  getDayTypeToday(dateStr: string): 'match_day' | 'training_day' | 'rest_day' {
    try {
      const data = localStorage.getItem(`${KEYS.DAY_TYPE}_${dateStr}`);
      return (data as any) || 'match_day';
    } catch {
      return 'match_day';
    }
  },

  setDayTypeToday(dateStr: string, dayType: 'match_day' | 'training_day' | 'rest_day'): void {
    localStorage.setItem(`${KEYS.DAY_TYPE}_${dateStr}`, dayType);
  },

  resetAll(): void {
    localStorage.clear();
  },
};
