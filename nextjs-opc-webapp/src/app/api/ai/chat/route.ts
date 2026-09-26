import { NextResponse } from 'next/server';
import { executeAiChat, ChatMessage } from '@/lib/ai/ai-client';
import { processInteractionForLearning } from '@/lib/ai/ai-learning';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Mensaje requerido' }, { status: 400 });
    }

    const messages: ChatMessage[] = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role && item.content) {
          messages.push({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: String(item.content),
          });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    const reply = await executeAiChat(messages);

    // Alimentar en segundo plano el modelo de aprendizaje continuo de Oli
    processInteractionForLearning(message, reply).catch((err) =>
      console.error('[AI Chat] Error en pipeline de aprendizaje continuo:', err)
    );

    return NextResponse.json({ success: true, reply });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error en consulta IA' },
      { status: 500 }
    );
  }
}
