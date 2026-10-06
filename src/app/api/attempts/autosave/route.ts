import { NextResponse } from 'next/server';
import { EvaluationService } from '@/services/evaluation.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, questionId, selectedOptionId, timeSpentSeconds, isFlagged } = body;

    if (!attemptId || !questionId) {
      return NextResponse.json(
        { success: false, error: 'attemptId and questionId are required.' },
        { status: 400 }
      );
    }

    const saved = EvaluationService.autosave(
      attemptId,
      questionId,
      selectedOptionId,
      timeSpentSeconds,
      isFlagged
    );

    return NextResponse.json({ success: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
