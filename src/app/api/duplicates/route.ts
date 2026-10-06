import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';
import { DuplicateService } from '@/services/duplicate.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const resolution = searchParams.get('resolution') || 'PENDING';

  const flags = store.duplicateFlags.filter((f) => f.resolution === resolution);

  const enrichedFlags = flags.map((f) => {
    const qA = store.questions.find((q) => q.id === f.questionAId);
    const qB = store.questions.find((q) => q.id === f.questionBId);

    return {
      ...f,
      questionA: qA,
      questionB: qB,
    };
  });

  return NextResponse.json({
    success: true,
    total: enrichedFlags.length,
    flags: enrichedFlags,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { flagId, action, resolvedBy } = body;

    if (!flagId || !action) {
      return NextResponse.json(
        { success: false, error: 'flagId and action are required.' },
        { status: 400 }
      );
    }

    const result = DuplicateService.resolveFlag(flagId, action, resolvedBy);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
