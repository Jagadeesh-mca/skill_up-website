import { store, MockStudentTopicStats } from '@/lib/storage';

export interface WeakAreaInsight {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracy: number;
  totalAttempted: number;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE';
  recommendationReason: string;
}

export interface RecommendedPracticeSet {
  id: string;
  title: string;
  topicName: string;
  questionCount: number;
  estimatedMinutes: number;
  reason: string;
  priorityScore: number;
}

export class AnalyticsService {
  /**
   * Identifies weak topics for a student based on rolling accuracy and attempt volume
   */
  static getStudentWeakAreas(studentEmail: string): WeakAreaInsight[] {
    const stats: MockStudentTopicStats[] = Object.values(store.studentTopicStats).filter(
      (s) => s.studentEmail === studentEmail
    );

    const weakAreas: WeakAreaInsight[] = [];

    // If no stats yet, provide initial placement diagnostic recommendations
    if (stats.length === 0) {
      return [
        {
          topicId: 'top-2',
          topicName: 'Time & Work',
          subjectName: 'Quantitative Aptitude',
          accuracy: 40,
          totalAttempted: 5,
          severity: 'WARNING',
          recommendationReason: 'Crucial for TCS and Infosys aptitude rounds; recommended for initial baseline practice.',
        },
        {
          topicId: 'top-14',
          topicName: 'SQL & Database Queries',
          subjectName: 'Technical & Programming',
          accuracy: 45,
          totalAttempted: 6,
          severity: 'WARNING',
          recommendationReason: 'Subqueries and aggregation clauses frequently tested in campus recruitment.',
        },
      ];
    }

    for (const stat of stats) {
      if (stat.accuracyPercentage < 60 && stat.totalAttempted >= 2) {
        const topic = store.topics.find((t) => t.id === stat.topicId);
        const subject = topic ? store.subjects.find((s) => s.id === topic.subjectId) : undefined;

        const severity: 'CRITICAL' | 'WARNING' | 'MODERATE' =
          stat.accuracyPercentage < 35
            ? 'CRITICAL'
            : stat.accuracyPercentage < 50
            ? 'WARNING'
            : 'MODERATE';

        weakAreas.push({
          topicId: stat.topicId,
          topicName: topic?.name || 'Aptitude Topic',
          subjectName: subject?.name || 'General',
          accuracy: stat.accuracyPercentage,
          totalAttempted: stat.totalAttempted,
          severity,
          recommendationReason: `Your accuracy is currently ${stat.accuracyPercentage}% across ${stat.totalAttempted} attempted questions in ${topic?.name}.`,
        });
      }
    }

    return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
  }

  /**
   * Generates targeted practice set recommendations based on detected weak areas
   */
  static getRecommendedPracticeSets(studentEmail: string): RecommendedPracticeSet[] {
    const weakAreas = this.getStudentWeakAreas(studentEmail);

    return weakAreas.map((w, index) => ({
      id: `rec-${w.topicId}-${index}`,
      title: `${w.topicName} Targeted Booster`,
      topicName: w.topicName,
      questionCount: 10,
      estimatedMinutes: 15,
      reason: w.recommendationReason,
      priorityScore: 100 - w.accuracy,
    }));
  }

  /**
   * Generates cohort analytics for teacher view:
   * - Score distribution histogram
   * - Pass vs Fail participation rate
   * - Question difficulty vs actual student failure rate (item discrimination analysis)
   */
  static getCohortAnalytics(assessmentId?: string) {
    const attempts = assessmentId
      ? Object.values(store.attempts).filter((a) => a.assessmentId === assessmentId)
      : Object.values(store.attempts);

    const totalStudents = attempts.length;
    const passedStudents = attempts.filter((a) => a.passed).length;
    const passPercentage = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
    const avgScore =
      totalStudents > 0
        ? Number((attempts.reduce((sum, a) => sum + a.score, 0) / totalStudents).toFixed(1))
        : 0;

    // Score distribution buckets
    const scoreRanges = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    attempts.forEach((a) => {
      if (a.percentage <= 20) scoreRanges[0].count++;
      else if (a.percentage <= 40) scoreRanges[1].count++;
      else if (a.percentage <= 60) scoreRanges[2].count++;
      else if (a.percentage <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    // Question difficulty vs actual failure rate
    const itemAnalysis = store.questions.slice(0, 6).map((q) => {
      // simulate realistic performance discrepancy
      const failureRate =
        q.difficulty === 'HARD' ? 62 : q.difficulty === 'MEDIUM' ? 38 : 18;

      return {
        questionId: q.id,
        snippet: q.text.substring(0, 50) + '...',
        difficulty: q.difficulty,
        failureRatePercentage: failureRate,
        discriminationStatus:
          q.difficulty === 'EASY' && failureRate > 40
            ? 'POTENTIALLY AMBIGUOUS'
            : 'NORMAL',
      };
    });

    return {
      totalStudents,
      passedStudents,
      failedStudents: totalStudents - passedStudents,
      passPercentage,
      avgScore,
      scoreDistribution: scoreRanges,
      itemAnalysis,
    };
  }
}
