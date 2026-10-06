import { NextResponse } from 'next/server';
import { ExportService } from '@/services/export.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target') || 'QUESTIONS';
  const assessmentId = searchParams.get('assessmentId');
  const status = searchParams.get('status') || undefined;

  if (target === 'QUESTIONS') {
    const buffer = ExportService.exportQuestionBankToExcel(status);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Hindustan_Question_Bank.xlsx"',
      },
    });
  }

  if (target === 'RESULTS' && assessmentId) {
    const buffer = ExportService.exportAssessmentResultsToExcel(assessmentId);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Results_${assessmentId}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ success: false, error: 'Invalid export request.' }, { status: 400 });
}
