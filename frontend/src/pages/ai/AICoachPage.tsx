import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Bot,
  Sparkles,
  TrendingUp,
  ClipboardList,
  PlusCircle,
} from 'lucide-react';
import { ChatMessage } from '@/components/AI/ChatMessage';
import { Button } from '@/components/UI/Button';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { aiService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { AIMessage } from '@/types';

const QUICK_PROMPTS = [
  { label: 'Crear plan personalizado', icon: ClipboardList, prompt: 'Crea un plan de entrenamiento personalizado basado en mi nivel de fitness y objetivos actuales.' },
  { label: 'Analizar mi progreso', icon: TrendingUp, prompt: 'Analiza mi progreso de los últimos 30 días y dame recomendaciones para mejorar.' },
  { label: 'Ejercicios para hoy', icon: Sparkles, prompt: '¿Qué ejercicios me recomiendas para hoy basándote en mi historial?' },
  { label: 'Dieta y nutrición', icon: Bot, prompt: 'Dame consejos de nutrición personalizados para alcanzar mis objetivos.' },
];

export default function AICoachPage() {
  const queryClient = useQueryClient();
  const { fullName } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: () => aiService.getConversations(),
  });

  const createConversationMutation = useMutation({
    mutationFn: () => aiService.createConversation(),
    onSuccess: (response) => {
      setActiveConversationId(response.data.id);
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
  });

  const conversations = conversationsData?.data ?? [];

  useEffect(() => {
    if (!activeConversationId) return;
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (conv) {
      setMessages(conv.messages);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && conversations.length === 0 && !activeConversationId) {
      createConversationMutation.mutate();
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, conversations.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeConversationId || isStreaming) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const assistantId = `msg-${Date.now()}-ai`;
    const assistantMessage: AIMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputText('');
    setIsStreaming(true);

    try {
      const es = aiService.streamChat(activeConversationId, text);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type: string; content?: string; tokens?: number };
          if (data.type === 'chunk' && data.content) {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + data.content } : m,
            ));
          } else if (data.type === 'done') {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false, tokens: data.tokens } : m,
            ));
            setIsStreaming(false);
            es.close();
            queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
          }
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setIsStreaming(false);
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || 'Lo siento, hubo un error al procesar tu mensaje.', isStreaming: false }
            : m,
        ));
        es.close();
      };
    } catch {
      try {
        await aiService.sendMessage(activeConversationId, text);
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Mensaje recibido. El streaming no está disponible.', isStreaming: false }
            : m,
        ));
      } catch {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Error al comunicarse con el entrenador IA.', isStreaming: false }
            : m,
        ));
      }
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  if (isLoading) return <PageLoader label="Cargando entrenador IA..." />;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-electric-500/30 to-neon-500/30 rounded-xl flex items-center justify-center border border-electric-500/20">
            <Bot size={22} className="text-electric-400" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Entrenador IA</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse" />
              <p className="text-xs text-gray-400">Claude AI • En línea</p>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => { createConversationMutation.mutate(); setMessages([]); }}
          leftIcon={<PlusCircle size={16} />}
          isLoading={createConversationMutation.isPending}
        >
          Nueva conversación
        </Button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar */}
        {conversations.length > 1 && (
          <div className="hidden lg:flex flex-col w-56 bg-dark-card border border-dark-border rounded-2xl p-3 gap-1 overflow-y-auto flex-shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-1">Conversaciones</p>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`text-left px-3 py-2 rounded-xl text-sm transition-all truncate ${
                  activeConversationId === conv.id
                    ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                }`}
              >
                {conv.title}
              </button>
            ))}
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-dark-card border border-dark-border rounded-2xl overflow-hidden min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-electric-500/20 to-neon-500/20 rounded-3xl flex items-center justify-center border border-electric-500/20">
                  <Bot size={40} className="text-electric-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-display font-bold text-white mb-2">
                    Hola, {fullName.split(' ')[0]}!
                  </h2>
                  <p className="text-gray-400 text-sm max-w-sm">
                    Soy tu entrenador personal con IA, impulsado por Claude. Puedo ayudarte con planes, nutrición, análisis de progreso y mucho más.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.prompt)}
                      className="flex items-center gap-3 p-3 bg-dark-elevated border border-dark-border rounded-xl hover:border-electric-500/30 hover:bg-electric-500/5 transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-electric-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <prompt.icon size={16} className="text-electric-400" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {prompt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message, i) => (
              <ChatMessage key={message.id} message={message} isLatest={i === messages.length - 1} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-dark-border p-4 flex-shrink-0">
            {messages.length > 0 && messages.length < 4 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.prompt)}
                    className="flex-shrink-0 px-3 py-1.5 bg-dark-elevated border border-dark-border rounded-xl text-xs text-gray-400 hover:text-white hover:border-electric-500/30 transition-all whitespace-nowrap"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta a tu entrenador IA... (Enter para enviar)"
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm resize-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim() || isStreaming}
                isLoading={isStreaming}
              >
                <Send size={18} />
              </Button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-2">
              Impulsado por Claude AI de Anthropic
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
