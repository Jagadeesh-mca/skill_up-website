import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';

export async function GET() {
  return NextResponse.json({
    success: true,
    companies: store.companies,
    subjects: store.subjects,
    topics: store.topics,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'COMPANY') {
      const newCompany = {
        id: 'comp-' + Date.now(),
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || '',
      };
      store.companies.push(newCompany);
      return NextResponse.json({ success: true, company: newCompany });
    }

    if (type === 'SUBJECT') {
      const newSub = {
        id: 'sub-' + Date.now(),
        code: data.code,
        name: data.name,
      };
      store.subjects.push(newSub);
      return NextResponse.json({ success: true, subject: newSub });
    }

    if (type === 'TOPIC') {
      const newTopic = {
        id: 'top-' + Date.now(),
        name: data.name,
        subjectId: data.subjectId,
      };
      store.topics.push(newTopic);
      return NextResponse.json({ success: true, topic: newTopic });
    }

    return NextResponse.json({ success: false, error: 'Invalid master data type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
