import { NextResponse } from 'next/server';
import { AssessmentService } from '@/services/assessment.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      companyId,
      subjectId,
      topicIds,
      difficultyMix,
      questionCount,
      durationMinutes,
      totalMarks,
      passMark,
      negativeMarkingRate,
      mode,
      studentEmail,
    } = body;

    if (!title || !questionCount || !durationMinutes) {
      return NextResponse.json(
        { success: false, error: 'Title, question count, and duration in minutes are required.' },
        { status: 400 }
      );
    }

    const result = AssessmentService.generateAssessment({
      title,
      companyId: companyId || undefined,
      subjectId: subjectId || undefined,
      topicIds: topicIds || [],
      difficultyMix: difficultyMix || { EASY: 40, MEDIUM: 40, HARD: 20 },
      questionCount: Number(questionCount),
      durationMinutes: Number(durationMinutes),
      totalMarks: totalMarks ? Number(totalMarks) : undefined,
      passMark: passMark ? Number(passMark) : undefined,
      negativeMarkingRate: negativeMarkingRate !== undefined ? Number(negativeMarkingRate) : 0.25,
      mode: mode === 'PRACTICE' ? 'PRACTICE' : 'FIXED',
      studentEmail,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 422 }); // 422 Unprocessable Entity with shortage report
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
