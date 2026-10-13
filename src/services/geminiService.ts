import { MatchDebrief, MatchRecord, UserProfile } from '../types';

export const geminiService = {
  async askCoach(
    messages: { role: 'user' | 'assistant'; content: string }[],
    userContext: UserProfile
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userContext }),
      });

      if (!response.ok) {
        throw new Error('Servidor no disponible');
      }

      const data = await response.json();
      return data.reply || data.fallback || 'Respuesta no disponible.';
    } catch {
      // Local sport-science fallback for 120kg footballer
      const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
      if (lastMsg.includes('rodilla') || lastMsg.includes('dolor') || lastMsg.includes('articulac')) {
        return 'Al pesar cerca de 120kg, las fuerzas de cizallamiento en la rodilla al frenar en sala son altísimas. Aplica hielo 15 min, evita correr en asfalto hoy, y haz 4 series de Wall Sit (sentadilla en pared a 80º) para activar el vasto medial sin rozar el cartílago.';
      }
      if (lastMsg.includes('comida') || lastMsg.includes('comer') || lastMsg.includes('dieta') || lastMsg.includes('antes de jugar')) {
        return 'Para tu partido (Sala o F9): Come 2.5 a 3 horas antes carbohidratos de fácil digestión (arroz o avena) + proteína magra (pechuga o claras), bajo en grasa y fibra para evitar pesadez. Y bebe 800ml de agua con una pizca de sal y limón.';
      }
      if (lastMsg.includes('futbol 9') || lastMsg.includes('f9')) {
        return 'En Fútbol 9 la clave para tu peso es la economía de carrera. Juega como delantero fijador o central organizador: pide el balón al pie, usa tu envergadura para pivotar y aguanta las marcas con el cuerpo en lugar de correr carreras de 40 metros al vacío.';
      }
      return 'Para rendir al máximo con 120kg en fútbol sala y F9: 1) Hidrátate con 4L diarios para lubricar cartílagos, 2) Mantén el déficit calórico moderado en días sin partido, y 3) Haz rotaciones de 3 minutos en sala para evitar fatiga extrema que detone lesiones.';
    }
  },

  async analyzeMatch(
    matchData: Partial<MatchRecord>,
    playerProfile: UserProfile
  ): Promise<MatchDebrief> {
    try {
      const response = await fetch('/api/ai/analyze-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchData, playerProfile }),
      });

      if (!response.ok) {
        throw new Error('Servidor no disponible');
      }

      const data = await response.json();
      if (data.analysis) {
        return data.analysis;
      }
    } catch {
      // fallback below
    }

    // High quality offline fallback
    const isFutsal = matchData.type === 'futsal';
    const rating = matchData.overallMatchRating || 7.5;
    const goals = matchData.goals || 0;
    const duels = matchData.duelsWon || 0;
    const knee = matchData.kneeDiscomfort || 2;

    return {
      tacticalSummary: `${isFutsal ? 'En pista de Fútbol Sala' : 'En campo de Fútbol 9'}, tu aprovechamiento del peso corporal (120kg) en duelos ganados (${duels}) y presencia en el área (${goals} goles) fue determinante para tu valoración de ${rating.toFixed(1)}/10.`,
      physicalAssessment: knee >= 3
        ? `Nivel de molestia en rodillas alto (${knee}/5). La superficie ${isFutsal ? 'dura' : 'sintética'} causó sobrecarga. Realiza descarga articular con piernas en pared y aplica frío local.`
        : `Excelente aguante articular (${knee}/5). Los músculos estabilizadores cumplieron su función de protección.`,
      nutritionTip: `Toma 35-40g de proteína magra antes de dormir + 1L de agua con sales para restituir la volemia y evitar calambres nocturnos.`,
      nextMatchFocus: isFutsal
        ? 'Pedir cambios tras 3-4 minutos continuos para que la fatiga no deteriore tu técnica de apoyo.'
        : 'Cerrar líneas por el centro y evitar desplazamientos laterales forzados a banda.',
    };
  },
};
