import { NextResponse } from 'next/server';
import { EvaluationService } from '@/services/evaluation.service';
import { store } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assessmentId, studentEmail, studentName } = body;

    if (!assessmentId || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'assessmentId and studentEmail are required.' },
        { status: 400 }
      );
    }

    const assessment = store.assessments.find((a) => a.id === assessmentId);
    if (!assessment) {
      return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
    }

    const attempt = EvaluationService.startAttempt(assessmentId, studentEmail, studentName || 'Student');

    // Retrieve full questions for this assessment
    const questions = assessment.questionIds
      .map((qId) => store.questions.find((q) => q.id === qId))
      .filter(Boolean)
      .map((q) => ({
        id: q!.id,
        text: q!.text,
        type: q!.type,
        difficulty: q!.difficulty,
        marks: q!.marks,
        negativeMarks: q!.negativeMarks,
        options: q!.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          position: opt.position,
        })), // Strip isCorrect on student test taking!
      }));

    return NextResponse.json({
      success: true,
      attempt,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        code: assessment.code,
        durationMinutes: assessment.durationMinutes,
        totalMarks: assessment.totalMarks,
        negativeMarkingRate: assessment.negativeMarkingRate,
      },
      questions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
