import { NextResponse } from 'next/server';
import { ImportService } from '@/services/import.service';

export async function GET() {
  const buffer = ImportService.generateSampleExcelBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="SkillUp_Question_Bank_Template.xlsx"',
    },
  });
}
