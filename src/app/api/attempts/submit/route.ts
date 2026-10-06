import { NextResponse } from 'next/server';
import { EvaluationService } from '@/services/evaluation.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, isTimeout } = body;

    if (!attemptId) {
      return NextResponse.json({ success: false, error: 'attemptId is required.' }, { status: 400 });
    }

    const evaluation = EvaluationService.submitAttempt(attemptId, Boolean(isTimeout));

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
