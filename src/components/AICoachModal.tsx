import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Dumbbell, 
  Utensils 
} from 'lucide-react';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola! Soy tu Preparador Físico y Nutricionista AI especializado en Fútbol Sala y Fútbol 9. Con tus 30 años y ~120kg, entrenamos 100% sin equipo (solo tu peso corporal, pared o silla en casa) para blindar tus rodillas, quemar grasa con un déficit seguro y potenciar tu rendimiento en la cancha. ¿Qué duda tienes sobre tus ejercicios en casa, tu próximo partido o tu alimentación?`,
      timestamp: 'Ahora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '🏠 Entrenar sin Equipo', prompt: '¿Cómo puedo ganar potencia para mis partidos de Futsal y Fútbol 9 entrenando en casa sin ningún tipo de pesas ni máquinas?' },
    { label: '🛡️ Rodillas a 120kg', prompt: '¿Por qué la sentadilla isométrica en pared (Wall Sit) es el mejor ejercicio sin equipo para blindar mis tendones rotulianos a 120kg?' },
    { label: '⚽ Comida Pre-Partido', prompt: '¿Qué debo comer exactamente 3 horas antes de mi partido de fútbol sala o F9 para tener chispa sin sentir pesadez?' },
    { label: '⏱️ Rotaciones en Sala', prompt: '¿Cómo debo gestionar mis turnos de juego en Fútbol Sala para no llegar asfixiado a los minutos finales?' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await geminiService.askCoach(chatHistory, profile);

      const assistantMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: 'Como recomendación inmediata: mantén 4L de agua diarios, protege tus articulaciones con rotaciones cortas en sala y consume proteína de calidad post-partido.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 border-0 sm:border sm:border-zinc-800 rounded-none sm:rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-full sm:h-[85vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold text-white">Coach AI Futsal & F9</h2>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Nutrición y articulaciones para 120kg
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-zinc-500 shrink-0">Consultas rápidas:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={isTyping}
              className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-500 text-zinc-950 font-medium'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-200 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-zinc-900/70 text-right' : 'text-zinc-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-zinc-400 italic">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span>Analizando datos de fútbol sala, F9 y nutrición...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pregunta sobre tu partido, dolor de rodilla, qué cenar o cómo entrenar..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
