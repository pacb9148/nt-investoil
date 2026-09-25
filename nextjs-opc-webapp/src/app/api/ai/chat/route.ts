import { NextResponse } from 'next/server';
import { executeAiChat, ChatMessage } from '@/lib/ai/ai-client';

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

    return NextResponse.json({ success: true, reply });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error en consulta IA' },
      { status: 500 }
    );
  }
}
