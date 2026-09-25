'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ChevronDown, Check, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export function PublicAiOrbe() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Bienvenido a la mesa ejecutiva de Invest Oil LLC. ¿En qué especificación de hidrocarburos, procedimiento de carga o consulta de trading podemos asistirle hoy?',
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
    'Oficinas y Contacto',
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
            text: 'En este momento estamos redirigiendo su consulta a nuestra mesa de operaciones en Houston (trading@investoil.es). Por favor intente en unos instantes.',
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
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Bot className="h-5 w-5 text-zinc-950" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Invest Oil Assistant
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded px-1 py-0.2">
                    AI Orbe
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400">Mesa de Trading & Hidrocarburos</p>
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
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-zinc-950 font-medium rounded-br-xs shadow-md'
                      : 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-white/10 rounded-full px-3 py-1.5 w-fit">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
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
              placeholder="Consulte sobre crudos, diésel, FOB, CIF..."
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

      {/* Orbe 3D Pulsante Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center focus:outline-none"
        aria-label="Abrir asistente de IA Invest Oil"
      >
        {/* Pulsos concéntricos animados */}
        <span className="absolute -inset-2 rounded-full bg-amber-500/20 animate-ping opacity-75 duration-1000" />
        <span className="absolute -inset-1 rounded-full bg-amber-500/30 blur-sm group-hover:bg-amber-400/40 transition duration-300" />

        {/* Cuerpo del Orbe Esférico */}
        <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 shadow-xl shadow-amber-500/30 border-2 border-amber-300/60 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {/* Brillo interno simulando esfera de vidrio/energía líquida */}
          <div className="absolute top-1 left-2 h-4 w-6 rounded-full bg-white/40 blur-[1px] rotate-[-25deg]" />
          <div className="absolute bottom-1 right-2 h-3 w-5 rounded-full bg-zinc-950/40 blur-[1px]" />
          
          {isOpen ? (
            <ChevronDown className="h-6 w-6 text-zinc-950 font-bold relative z-10 transition-transform" />
          ) : (
            <Sparkles className="h-6 w-6 text-zinc-950 fill-zinc-950/20 relative z-10 animate-pulse" />
          )}
        </div>

        {/* Badge Flotante con Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-zinc-950/90 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ¿Dudas de trading? Pregúntanos
          </div>
        )}
      </button>
    </div>
  );
}
