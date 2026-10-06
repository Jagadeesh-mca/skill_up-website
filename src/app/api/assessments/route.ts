import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const status = searchParams.get('status');

  let assessments = [...store.assessments];

  if (mode) assessments = assessments.filter((a) => a.mode === mode);
  if (status) assessments = assessments.filter((a) => a.status === status);

  const enriched = assessments.map((a) => {
    const company = store.companies.find((c) => c.id === a.companyId);
    return {
      ...a,
      companyName: company?.name || 'All Companies',
      questionCount: a.questionIds.length,
    };
  });

  return NextResponse.json({
    success: true,
    total: enriched.length,
    assessments: enriched,
  });
}
