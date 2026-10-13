import React, { useState, useEffect } from 'react';
import { UserProfile, MatchRecord, Routine, MealItem, WeightEntry } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MatchEvaluator } from './components/MatchEvaluator';
import { WorkoutRoutines } from './components/WorkoutRoutines';
import { DietManager } from './components/DietManager';
import { WeightProgress } from './components/WeightProgress';
import { AICoachModal } from './components/AICoachModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [matches, setMatches] = useState<MatchRecord[]>(() => storageService.getMatches());
  const [routines, setRoutines] = useState<Routine[]>(() => storageService.getRoutines());
  const [meals, setMeals] = useState<MealItem[]>(() => storageService.getMeals());
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => storageService.getWeightEntries());

  const todayStr = new Date().toISOString().split('T')[0];
  const [waterToday, setWaterToday] = useState<number>(() => storageService.getWaterToday(todayStr));
  const [dayType, setDayType] = useState<'match_day' | 'training_day' | 'rest_day'>(() =>
    storageService.getDayTypeToday(todayStr)
  );

  // Modals state
  const [isOpenNewMatch, setIsOpenNewMatch] = useState(false);
  const [isOpenAICoach, setIsOpenAICoach] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);

  // Sync profile when latest weight changes
  useEffect(() => {
    if (weightEntries.length > 0) {
      const sorted = [...weightEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latest = sorted[0].weightKg;
      if (latest !== profile.currentWeightKg) {
        const updatedProfile = { ...profile, currentWeightKg: latest };
        setProfile(updatedProfile);
        storageService.saveProfile(updatedProfile);
      }
    }
  }, [weightEntries]);

  // Handlers
  const handleAddMatch = (match: MatchRecord) => {
    const updated = storageService.addMatch(match);
    setMatches(updated);
  };

  const handleDeleteMatch = (id: string) => {
    const updated = storageService.deleteMatch(id);
    setMatches(updated);
  };

  const handleAddMeal = (meal: MealItem) => {
    const updated = storageService.addMeal(meal);
    setMeals(updated);
  };

  const handleDeleteMeal = (id: string) => {
    const updated = storageService.deleteMeal(id);
    setMeals(updated);
  };

  const handleAddWater = (amountMl: number) => {
    const newTotal = waterToday + amountMl;
    setWaterToday(newTotal);
    storageService.setWaterToday(todayStr, newTotal);
  };

  const handleResetWater = () => {
    setWaterToday(0);
    storageService.setWaterToday(todayStr, 0);
  };

  const handleSetDayType = (type: 'match_day' | 'training_day' | 'rest_day') => {
    setDayType(type);
    storageService.setDayTypeToday(todayStr, type);
  };

  const handleAddWeightEntry = (entry: WeightEntry) => {
    const updated = storageService.addWeightEntry(entry);
    setWeightEntries(updated);
  };

  const handleUpdateTargetWeight = (targetKg: number) => {
    const updated = { ...profile, targetWeightKg: targetKg };
    setProfile(updated);
    storageService.saveProfile(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewMatch={() => setIsOpenNewMatch(true)}
        onOpenAICoach={() => setIsOpenAICoach(true)}
        currentWeight={profile.currentWeightKg}
      />

      {/* Main View Container with safe bottom padding for mobile navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            matches={matches}
            routines={routines}
            meals={meals}
            waterToday={waterToday}
            dayType={dayType}
            onSetDayType={handleSetDayType}
            onAddWater={handleAddWater}
            onNavigate={(tab) => setCurrentTab(tab)}
            onStartRoutine={(routine) => setActiveWorkout(routine)}
            onOpenNewMatch={() => setIsOpenNewMatch(true)}
            onOpenAICoach={() => setIsOpenAICoach(true)}
          />
        )}

        {currentTab === 'matches' && (
          <MatchEvaluator
            matches={matches}
            profile={profile}
            onAddMatch={handleAddMatch}
            onDeleteMatch={handleDeleteMatch}
            isOpenNewMatchModal={isOpenNewMatch}
            onCloseNewMatchModal={() => setIsOpenNewMatch(false)}
            onOpenNewMatchModal={() => setIsOpenNewMatch(true)}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutRoutines
            routines={routines}
            activeWorkout={activeWorkout}
            onStartRoutine={(routine) => setActiveWorkout(routine)}
            onCloseWorkoutPlayer={() => setActiveWorkout(null)}
          />
        )}

        {currentTab === 'diet' && (
          <DietManager
            profile={profile}
            meals={meals}
            waterToday={waterToday}
            dayType={dayType}
            onSetDayType={handleSetDayType}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
          />
        )}

        {currentTab === 'weight' && (
          <WeightProgress
            profile={profile}
            weightEntries={weightEntries}
            onAddWeightEntry={handleAddWeightEntry}
            onUpdateTargetWeight={handleUpdateTargetWeight}
          />
        )}
      </main>

      {/* AI Coach Assistant Modal */}
      <AICoachModal
        isOpen={isOpenAICoach}
        onClose={() => setIsOpenAICoach(false)}
        profile={profile}
      />

      {/* Minimal Clean Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">MATCHFIT</span>
            <span>·</span>
            <span>Fútbol Sala & Fútbol 9 Athletic Performance</span>
          </div>
          <div>
            Diseñado para deportistas de 30 años con acondicionamiento de alta protección articular.
          </div>
        </div>
      </footer>
    </div>
  );
}
