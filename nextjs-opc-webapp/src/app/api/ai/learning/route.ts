import { NextResponse } from 'next/server';
import { getAiSettings, saveAiSettings } from '@/lib/ai/ai-service';
import {
  promoteExperienceToFaq,
  addExperienceToKnowledgeBase,
  addManualExperience,
  deleteLearnedExperience,
} from '@/lib/ai/ai-learning';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAiSettings();
    return NextResponse.json({
      success: true,
      enableContinuousLearning: settings.enableContinuousLearning !== false,
      learnedExperiences: settings.learnedExperiences || [],
      trainingFaqsCount: (settings.trainingFaqs || []).length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'toggle_learning') {
      const settings = await getAiSettings();
      const nextState = body.enable !== undefined ? Boolean(body.enable) : !settings.enableContinuousLearning;
      await saveAiSettings({
        ...settings,
        enableContinuousLearning: nextState,
      });
      return NextResponse.json({ success: true, enableContinuousLearning: nextState });
    }

    if (action === 'promote_faq') {
      const { experienceId, customAnswer } = body;
      if (!experienceId) {
        return NextResponse.json({ success: false, error: 'experienceId requerido' }, { status: 400 });
      }
      const res = await promoteExperienceToFaq(experienceId, customAnswer);
      return NextResponse.json(res);
    }

    if (action === 'promote_kb') {
      const { experienceId } = body;
      if (!experienceId) {
        return NextResponse.json({ success: false, error: 'experienceId requerido' }, { status: 400 });
      }
      const res = await addExperienceToKnowledgeBase(experienceId);
      return NextResponse.json(res);
    }

    if (action === 'add_manual') {
      const { userQuery, replySummary, topic, language, insight } = body;
      if (!userQuery || !insight) {
        return NextResponse.json(
          { success: false, error: 'userQuery e insight son requeridos' },
          { status: 400 }
        );
      }
      const res = await addManualExperience({
        userQuery,
        replySummary: replySummary || insight,
        topic: topic || 'Trading General',
        language: language || 'es',
        insight,
        status: 'approved',
        source: 'manual_training',
      });
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }
    const res = await deleteLearnedExperience(id);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
