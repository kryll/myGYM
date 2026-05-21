import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AIMessage } from '@/types';
import { StreamingText } from './StreamingText';

interface ChatMessageProps {
  message: AIMessage;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx('flex gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end',
          isUser
            ? 'bg-electric-500/20 border border-electric-500/30'
            : 'bg-gradient-to-br from-electric-500/30 to-neon-500/30 border border-electric-500/20',
        )}
      >
        {isUser ? (
          <User size={16} className="text-electric-400" />
        ) : (
          <Bot size={16} className="text-electric-400" />
        )}
      </div>

      {/* Message bubble */}
      <div className={clsx('max-w-[75%]', isUser && 'items-end flex flex-col')}>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-electric-500/15 border border-electric-500/30 text-white rounded-tr-sm'
              : 'bg-dark-elevated border border-dark-border text-gray-200 rounded-tl-sm',
          )}
        >
          {isAssistant && message.isStreaming && isLatest ? (
            <StreamingText text={message.content} />
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className={clsx('flex items-center gap-2 mt-1 px-1', isUser && 'flex-row-reverse')}>
          <span className="text-xs text-gray-600">
            {formatDistanceToNow(new Date(message.timestamp), {
              addSuffix: true,
              locale: es,
            })}
          </span>
          {message.tokens && (
            <span className="text-xs text-gray-600">{message.tokens} tokens</span>
          )}
        </div>

        {/* AI metadata */}
        {isAssistant && message.metadata && (
          <div className="mt-2 px-1 flex flex-wrap gap-1">
            {message.metadata.planGenerated && (
              <span className="text-xs px-2 py-0.5 bg-neon-500/10 text-neon-400 border border-neon-500/20 rounded-full">
                Plan generado
              </span>
            )}
            {message.metadata.exercisesRecommended && message.metadata.exercisesRecommended.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-electric-500/10 text-electric-400 border border-electric-500/20 rounded-full">
                {message.metadata.exercisesRecommended.length} ejercicios recomendados
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;
