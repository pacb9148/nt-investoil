import { NextResponse } from 'next/server';
import { executeAiChat, ChatMessage } from '@/lib/ai/ai-client';
import { processInteractionForLearning } from '@/lib/ai/ai-learning';
import { getUserMemory, extractAndEnrichMemory } from '@/lib/ai/ai-user-memory';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Mensaje requerido' }, { status: 400 });
    }

    const sid = sessionId && typeof sessionId === 'string' ? sessionId : 'session-default';

    // 1. Recuperar o extraer y enriquecer la memoria persistente del usuario (Setter B2B)
    const existingProfile = await getUserMemory(sid);
    const userProfile = await extractAndEnrichMemory(sid, message, existingProfile);

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

    // 2. Ejecutar la respuesta con contexto de memoria y rol de setter B2B
    const reply = await executeAiChat(messages, userProfile);

    // 3. Alimentar en segundo plano el modelo de aprendizaje continuo de Oli
    processInteractionForLearning(message, reply).catch((err) =>
      console.error('[AI Chat] Error en pipeline de aprendizaje continuo:', err)
    );

    return NextResponse.json({
      success: true,
      reply,
      userProfile: {
        name: userProfile.name,
        company: userProfile.company,
        qualificationStage: userProfile.qualificationStage,
        productsOfInterest: userProfile.productsOfInterest,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error en consulta IA' },
      { status: 500 }
    );
  }
}
