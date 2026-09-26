'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { OliFace } from './oli-face';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export function PublicAiOrbe() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: '¡Hola! Soy Oli, el agente oficial de Invest Oil LLC (Petroleum and Derivates Markets).\nFacilitadores entre compradores y vendedores de primer orden en el mercado del petróleo y sus derivados. ¿En qué puedo orientarle hoy?',
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'Especificación Diésel EN590',
    'Procedimiento Jet Fuel A-1',
    'Mercado de Pet Coke',
    'Sedes y Contacto',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            text: 'En este momento puede canalizar su consulta directamente a trading@investoil.es o a través de nuestro formulario de contacto en la web.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: 'Conexión temporalmente interrumpida. Puede contactar a nuestro equipo vía trading@investoil.es.',
          timestamp: 'Ahora',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] rounded-2xl border border-amber-500/30 bg-zinc-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-amber-500/20">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-b border-amber-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <OliFace size="md" isOpen={isOpen} isTyping={isTyping} />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Oli
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded px-1.5 py-0.5 font-medium">
                    Agente Oficial
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400">Invest Oil LLC · Petroleum & Derivates</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              title="Minimizar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start items-start'
                }`}
              >
                {m.sender === 'agent' && (
                  <div className="shrink-0 mt-0.5">
                    <OliFace size="sm" isHappy={true} />
                  </div>
                )}
                <div
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-zinc-950 font-medium rounded-br-xs shadow-md'
                        : 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-bl-xs shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <OliFace size="sm" isTyping={true} />
                <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-white/10 rounded-full px-3 py-1.5 w-fit">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 border-t border-white/5 bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] whitespace-nowrap bg-white/5 hover:bg-amber-500/10 hover:text-amber-300 text-zinc-400 border border-white/10 hover:border-amber-500/30 rounded-full px-2.5 py-1 transition shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/10 bg-zinc-900/70 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a Oli sobre diésel, crudos, ICPO, sedes..."
              className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-8 w-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center hover:bg-amber-400 disabled:opacity-40 transition shrink-0 shadow"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Orbe 3D Animado de Oli */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
        aria-label="Abrir asistente Oli de Invest Oil"
      >
        {/* Pulsos concéntricos animados de energía */}
        <span className="absolute -inset-2 rounded-full bg-amber-500/20 animate-ping opacity-75 duration-1000" />
        <span className="absolute -inset-1 rounded-full bg-amber-500/30 blur-sm group-hover:bg-amber-400/40 transition duration-300" />

        {/* Rostro 3D Expresivo de Oli */}
        <div className="relative">
          <OliFace size="lg" isOpen={isOpen} isTyping={isTyping} isHovered={isHovered} />

          {/* Indicador de minimizar cuando el chat está desplegado */}
          {isOpen && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-zinc-950/90 border border-amber-500/50 flex items-center justify-center shadow">
              <ChevronDown className="h-3 w-3 text-amber-300" />
            </div>
          )}
        </div>

        {/* Badge Flotante con Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-zinc-950/90 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            👋 ¡Hola! Soy Oli. ¿Puedo ayudarte?
          </div>
        )}
      </button>
    </div>
  );
}
