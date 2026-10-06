import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'STUDENT';
  const email = searchParams.get('email') || 'student@student.hindustanuniv.ac.in';
  const assessmentId = searchParams.get('assessmentId') || undefined;

  if (type === 'STUDENT') {
    const weakAreas = AnalyticsService.getStudentWeakAreas(email);
    const recommendations = AnalyticsService.getRecommendedPracticeSets(email);

    return NextResponse.json({
      success: true,
      weakAreas,
      recommendations,
    });
  }

  // Teacher / Cohort Analytics
  const cohort = AnalyticsService.getCohortAnalytics(assessmentId);
  return NextResponse.json({
    success: true,
    cohort,
  });
}
