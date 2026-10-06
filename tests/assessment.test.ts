import { describe, it, expect } from 'vitest';
import { AssessmentService } from '../src/services/assessment.service';
import { store } from '../src/lib/storage';

describe('AssessmentService', () => {
  it('should successfully generate an assessment when question bank has sufficient questions', () => {
    const result = AssessmentService.generateAssessment({
      title: 'TCS Aptitude Test',
      companyId: 'comp-1',
      difficultyMix: { EASY: 50, MEDIUM: 50, HARD: 0 },
      questionCount: 2,
      durationMinutes: 30,
      mode: 'FIXED',
      topicIds: [],
    });

    expect(result.success).toBe(true);
    expect(result.assessment).toBeDefined();
    expect(result.assessment?.questionIds.length).toBe(2);
  });

  it('should return explicit shortage report when requested count exceeds approved pool', () => {
    const result = AssessmentService.generateAssessment({
      title: 'Overloaded Test',
      companyId: 'comp-1',
      difficultyMix: { EASY: 30, MEDIUM: 40, HARD: 30 },
      questionCount: 100, // Question bank only has ~6 questions
      durationMinutes: 60,
      mode: 'FIXED',
      topicIds: [],
    });

    expect(result.success).toBe(false);
    expect(result.shortageReport).toBeDefined();
    expect(result.shortageReport?.isShortage).toBe(true);
    expect(result.shortageReport?.totalRequested).toBe(100);
    expect(result.error).toContain('Insufficient approved questions');
  });

  it('in PRACTICE mode, should prioritize unseen questions and not duplicate', () => {
    // Record that student has seen question q-1
    store.studentHistory.push({
      studentEmail: 'test.student@student.hindustanuniv.ac.in',
      questionId: 'q-1',
      firstSeenAt: new Date().toISOString(),
      timesSeen: 1,
      lastResult: 'CORRECT',
    });

    const result = AssessmentService.generateAssessment({
      title: 'Personalized Practice',
      difficultyMix: { EASY: 50, MEDIUM: 50, HARD: 0 },
      questionCount: 2,
      durationMinutes: 20,
      mode: 'PRACTICE',
      studentEmail: 'test.student@student.hindustanuniv.ac.in',
      topicIds: [],
    });

    expect(result.success).toBe(true);
    expect(result.assessment?.questionIds).not.toContain('q-1');
  });
});
