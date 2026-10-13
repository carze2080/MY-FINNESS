import { MatchRecord } from '../types';

export function calculateMatchRating(data: Partial<MatchRecord>): number {
  let score = 6.0; // Base score for starting a match

  // Result influence
  if (data.result === 'win') score += 0.4;
  else if (data.result === 'loss') score -= 0.3;

  // Offensive contribution
  const isFutsal = data.type === 'futsal';
  const goalWeight = isFutsal ? 0.75 : 0.95;
  score += (data.goals || 0) * goalWeight;
  score += (data.assists || 0) * 0.5;
  score += (data.shotsOnTarget || 0) * 0.15;
  score += (data.keyPasses || 0) * 0.25;

  // Defensive & Duel contribution (critical for a 120kg player holding lines)
  score += (data.ballsRecovered || 0) * 0.2;
  const netDuels = (data.duelsWon || 0) - (data.duelsLost || 0) * 0.5;
  score += Math.max(-0.6, Math.min(1.2, netDuels * 0.15));

  // Physical endurance factor
  if (data.staminaAtEnd) {
    if (data.staminaAtEnd >= 8) score += 0.3;
    else if (data.staminaAtEnd <= 4) score -= 0.4;
  }

  // Minutes played weight factor
  const minPlayed = data.minutesPlayed || 20;
  const targetMin = isFutsal ? 25 : 45;
  if (minPlayed >= targetMin) {
    score += 0.2;
  }

  // Bound between 1.0 and 10.0
  const finalRating = Math.max(1.0, Math.min(10.0, score));
  return Math.round(finalRating * 10) / 10;
}
