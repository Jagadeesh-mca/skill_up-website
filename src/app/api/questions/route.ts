import { NextResponse } from 'next/server';
import { store, MockQuestion } from '@/lib/storage';
import { AIService } from '@/services/ai.service';
import { DuplicateService } from '@/services/duplicate.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const difficulty = searchParams.get('difficulty');
  const companyId = searchParams.get('companyId');
  const topicId = searchParams.get('topicId');
  const search = searchParams.get('search')?.toLowerCase();

  let filtered = [...store.questions];

  if (status) filtered = filtered.filter((q) => q.status === status);
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
  if (companyId) filtered = filtered.filter((q) => q.companyIds.includes(companyId));
  if (topicId) filtered = filtered.filter((q) => q.topicIds.includes(topicId));
  if (search) {
    filtered = filtered.filter(
      (q) => q.text.toLowerCase().includes(search) || q.explanation?.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    questions: filtered,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, options, difficulty, marks, negativeMarks, explanation, companyIds, topicIds, source } = body;

    if (!text || !options || options.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Question text and at least 2 options are required.' },
        { status: 400 }
      );
    }

    const dupCheck = DuplicateService.detectDuplicate(
      text,
      options.map((o: any) => o.text)
    );

    const qId = 'q-man-' + Date.now();
    const newQuestion: MockQuestion = {
      id: qId,
      text,
      type: 'MCQ',
      difficulty: difficulty || 'MEDIUM',
      marks: marks || 1.0,
      negativeMarks: negativeMarks || 0.0,
      source: source || 'Teacher Manual Entry',
      status: 'APPROVED',
      explanation: explanation || '',
      normalizedHash: DuplicateService.normalizeText(text),
      options: options.map((opt: any, idx: number) => ({
        id: `opt-${qId}-${idx}`,
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect),
        position: idx,
      })),
      companyIds: companyIds || ['comp-1'],
      topicIds: topicIds || ['top-1'],
      embedding: AIService.generateEmbedding(text),
      createdAt: new Date().toISOString(),
    };

    store.questions.unshift(newQuestion);

    if (dupCheck.isDuplicate && dupCheck.matchedQuestion) {
      store.duplicateFlags.push({
        id: 'dup-' + Date.now(),
        questionAId: dupCheck.matchedQuestion.id,
        questionBId: qId,
        questionAText: dupCheck.matchedQuestion.text,
        questionBText: text,
        type: dupCheck.type!,
        similarityScore: dupCheck.similarityScore,
        resolution: 'PENDING',
        createdAt: new Date().toISOString(),
      });
    }

    store.logAudit('CREATE_QUESTION', 'Question', qId, 'teacher@hindustanuniv.ac.in', {
      text,
      difficulty,
      isDuplicate: dupCheck.isDuplicate,
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { questionId, status, text, difficulty, options, explanation } = body;

    const question = store.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    if (status) question.status = status;
    if (text) question.text = text;
    if (difficulty) question.difficulty = difficulty;
    if (explanation) question.explanation = explanation;
    if (options && Array.isArray(options)) {
      question.options = options.map((opt: any, idx: number) => ({
        id: opt.id || `opt-${question.id}-${idx}`,
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect),
        position: idx,
      }));
    }

    store.logAudit('UPDATE_QUESTION', 'Question', questionId, 'teacher@hindustanuniv.ac.in', {
      newStatus: status,
      difficulty,
    });

    return NextResponse.json({ success: true, question });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
