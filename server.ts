import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Initialize Gemini Client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini client initialization warning:', err);
  }
}

// System prompt context for the football coach & sports nutritionist
const SYSTEM_INSTRUCTION = `Eres el Director Técnico y Preparador Físico Deportivo Especializado de MatchFit.
Tu usuario es un jugador de 30 años con peso de aproximadamente 120 kg que practica FÚTBOL SALA (pista dura, giros rápidos, alta demanda rotacional de rodilla) y FÚTBOL 9 (campo sintético/césped, mayor distancia aeróbica, transiciones).

CRITERIOS CLAVE QUE DEBES APLICAR SIEMPRE:
1. ENTRENAMIENTO 100% SIN EQUIPAMIENTO (CALISTENIA & CASA): El usuario no cuenta con máquinas, mancuernas ni bandas. Todos los ejercicios deben ser con su propio peso corporal, utilizando una pared de su casa, una silla firme o el suelo.
2. PROTECCIÓN ARTICULAR ESTRICTA: A 120kg, las fuerzas de frenado e impacto sobre rodillas (rótula, meniscos, ligamentos cruzados) y tobillos pueden multiplicar hasta 5-7x su peso. NUNCA recomiendes saltos pliométricos, carreras en asfalto o sentadillas profundas sin control. Prioriza isometría en pared (Wall Sit), sentadillas a silla con pausa, puente de glúteos y shadow footwork defensivo de fútbol sala sin impacto.
3. NUTRICIÓN DE RENDIMIENTO + DÉFICIT SEGURO: El objetivo es perder peso de forma gradual y sostenible sin perder masa muscular ni llegar agotado a los partidos.
   - En Días de Partido: Asegurar glucógeno (carbohidratos complejos 3-4 horas antes, hidratación con electrolitos pre y post).
   - En Días de Descanso/Entrenamiento: Déficit moderado (~600-800 kcal), alto aporte proteico (1.8-2.0g por kg de masa magra), vegetales y grasas antiinflamatorias (Omega-3, cúrcuma) para mitigar inflamación articular.
4. DOSIFICACIÓN EN CANCHA:
   - Fútbol Sala: Turnos cortos de 2 a 4 minutos con cambios regulares para mantener intensidad anaeróbica sin fatiga extrema que induzca lesiones.
   - Fútbol 9: Gestión del posicionamiento inteligente (posiciones como pivote/delantero fijador o defensa central organizador), evitando carreras innecesarias de 60 metros si no hay cobertura.
5. TONO: Motivador, científico, cercano, directo, en español.`;

// Helper to generate heuristic debrief
function generateHeuristicDebrief(matchData: any, _profile: any) {
  const matchType = matchData.type || 'Fútbol Sala';
  const rating = matchData.overallMatchRating || 7.5;
  const kneeStrain = matchData.kneeDiscomfort || 2;
  const fatigue = matchData.staminaAtEnd || 7;
  const duels = matchData.duelsWon || 0;
  const goals = matchData.goals || 0;

  return {
    tacticalSummary: `${matchType === 'futsal' ? 'En la pista dura de Fútbol Sala' : 'En el campo de Fútbol 9'}, tu aprovechamiento del peso corporal (120kg) en duelos ganados (${duels}) y presencia en el área (${goals} goles) fue determinante para tu valoración de ${Number(rating).toFixed(1)}/10.`,
    physicalAssessment: kneeStrain >= 3
      ? `Atención a la molestia articular (${kneeStrain}/5). La superficie ${matchType === 'futsal' ? 'dura de sala' : 'sintética de F9'} genera microtrauma. Es imperativo aplicar hielo 15 min, elevar piernas a 90º en pared y evitar impacto articular durante 48h.`
      : `Excelente tolerancia articular (${kneeStrain}/5). Tus músculos estabilizadores (glúteo medio y vasto interno) absorbieron adecuadamente las fuerzas de desaceleración.`,
    nutritionTip: `Recuperación post-partido: consume 35-40g de proteína magra + 60g de carbohidratos en las próximas 2 horas. No olvides 1.5L de agua con sales para reponer el sudor de 120kg de masa corporal.`,
    nextMatchFocus: matchType === 'futsal'
      ? 'En Sala: Realiza rotaciones de 3 minutos para mantener la explosividad sin que la fatiga deteriore la técnica de apoyo.'
      : 'En F9: Optimiza el posicionamiento central para economizar carreras de más de 25 metros en transiciones defensivas.'
  };
}

// Helper to call Gemini with a 4.5s timeout race
async function callGeminiWithTimeout(fn: () => Promise<any>, timeoutMs = 4500): Promise<any> {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout en llamada AI')), timeoutMs)
  );
  return Promise.race([fn(), timeoutPromise]);
}

// API endpoint for AI Coach chat
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  const { messages, userContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Formato de mensajes inválido' });
  }

  const latestUserMessage = messages[messages.length - 1]?.content || '';

  if (aiClient) {
    try {
      const conversationHistory = messages.slice(-6).map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Entrenador'}: ${m.content}`).join('\n');
      const prompt = `${SYSTEM_INSTRUCTION}

CONTEXTO DEL USUARIO ACTUAL:
${JSON.stringify(userContext || { age: 30, weight: 120, sports: ['Futbol Sala', 'Futbol 9'] }, null, 2)}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory}

ÚLTIMA PREGUNTA/CONSULTA DEL JUGADOR:
"${latestUserMessage}"

Por favor, responde de forma concisa, práctica y directamente aplicable a sus partidos de fútbol sala / fútbol 9, su dieta o sus articulaciones:`;

      const response = await callGeminiWithTimeout(() =>
        aiClient!.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        })
      );

      if (response?.text) {
        return res.json({ reply: response.text });
      }
    } catch (err: any) {
      console.warn('AI fallback triggered:', err?.message || err);
    }
  }

  // High quality heuristic response
  const lower = latestUserMessage.toLowerCase();
  let fallbackReply = 'Para rendir al máximo con 120kg en fútbol sala y F9: 1) Hidrátate con 4L diarios para lubricar cartílagos, 2) Mantén el déficit calórico moderado en días sin partido (~600 kcal), y 3) Haz rotaciones de 3 minutos en sala para evitar fatiga extrema que detone lesiones.';

  if (lower.includes('rodilla') || lower.includes('dolor') || lower.includes('molestia') || lower.includes('articulac')) {
    fallbackReply = 'A 120kg, las fuerzas sobre la rótula al frenar en sala pueden alcanzar hasta 700kg de presión momentánea. Si tienes molestia: 1) Hielo local 15 minutos, 2) Piernas elevadas a 90º en pared, 3) 4 series de Wall Sit (isometría en pared a 80º) para regenerar la tensión del tendón rotuliano sin roce óseo.';
  } else if (lower.includes('comer') || lower.includes('dieta') || lower.includes('pre-partido') || lower.includes('antes')) {
    fallbackReply = 'Protocolo Pre-Partido para 120kg: 2.5 a 3 horas antes consume carbohidratos de vaciado gástrico rápido (60-80g de avena o arroz blanco con plátano) + 30g de proteína magra (claras o pollo) con poca grasa para evitar reflujo. Además, bebe 750ml de agua con una pizca de sal marina para llegar con buena volemia.';
  } else if (lower.includes('futsal') || lower.includes('sala')) {
    fallbackReply = 'Estrategia en Fútbol Sala: Juega como Pívot de referencia o Cierre táctico. En lugar de correr tras balones divididos en los laterales, utiliza tu corpulencia para recibir de espaldas, proteger el esférico y descargar a las alas que llegan de cara.';
  } else if (lower.includes('f9') || lower.includes('futbol 9')) {
    fallbackReply = 'Estrategia en Fútbol 9: El campo es más grande y el sintético retiene calor. Juega en franjas de 20 metros máximo. Si juegas de 9, fija a los dos centrales rivales; si juegas de central, organiza la línea defensiva con voz de mando para no tener que correr hacia atrás a contracorriente.';
  }

  res.json({ reply: fallbackReply });
});

// API endpoint for match evaluation analysis
app.post('/api/ai/analyze-match', async (req: Request, res: Response) => {
  const { matchData, playerProfile } = req.body;
  if (!matchData) {
    return res.status(400).json({ error: 'Datos de partido ausentes' });
  }

  if (aiClient) {
    try {
      const prompt = `${SYSTEM_INSTRUCTION}

DATOS DEL PARTIDO REGISTRADO:
${JSON.stringify(matchData, null, 2)}

PERFIL DEL JUGADOR:
${JSON.stringify(playerProfile || { age: 30, weight: 120 }, null, 2)}

Genera una evaluación técnica, física y nutricional del partido en formato JSON EXACTO con las siguientes claves:
{
  "tacticalSummary": "Breve análisis táctico y de impacto en el juego",
  "physicalAssessment": "Evaluación del gasto físico, gestión de fatiga y salud de rodillas/tobillos considerando sus 120kg",
  "nutritionTip": "Consejo nutricional inmediato de recuperación según el desgaste del partido",
  "nextMatchFocus": "Un aspecto clave a corregir o potenciar para su siguiente encuentro"
}
Responde únicamente con el JSON válido.`;

      const response = await callGeminiWithTimeout(() =>
        aiClient!.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        })
      );

      if (response?.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ analysis: parsed });
      }
    } catch (err: any) {
      console.warn('AI fallback on match debrief:', err?.message || err);
    }
  }

  // High quality heuristic sport science debrief
  const analysis = generateHeuristicDebrief(matchData, playerProfile);
  res.json({ analysis });
});

// API health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start Express and integrate Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
