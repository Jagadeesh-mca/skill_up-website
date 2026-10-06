import { NextResponse } from 'next/server';
import { ImportService } from '@/services/import.service';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadedBy = (formData.get('uploadedBy') as string) || 'faculty@hindustanuniv.ac.in';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No spreadsheet file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await ImportService.processUpload(buffer, file.name, uploadedBy);

    return NextResponse.json({
      success: true,
      batch: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
