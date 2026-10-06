import { store, MockQuestion, MockAssessment } from '@/lib/storage';

export interface AssessmentGenerationRequest {
  title: string;
  companyId?: string;
  subjectId?: string;
  topicIds: string[];
  difficultyMix: {
    EASY: number;   // percentage e.g. 40
    MEDIUM: number; // percentage e.g. 40
    HARD: number;   // percentage e.g. 20
  };
  questionCount: number;
  durationMinutes: number;
  totalMarks?: number;
  passMark?: number;
  negativeMarkingRate?: number;
  mode: 'FIXED' | 'PRACTICE';
  studentEmail?: string; // Required for personalized PRACTICE mode
  focusWeakTopics?: boolean;
}

export interface ShortageReport {
  isShortage: boolean;
  totalRequested: number;
  totalAvailable: number;
  shortageCount: number;
  breakdown: {
    EASY: { requested: number; available: number; shortage: number };
    MEDIUM: { requested: number; available: number; shortage: number };
    HARD: { requested: number; available: number; shortage: number };
  };
}

export interface AssessmentGenerationResult {
  success: boolean;
  assessment?: MockAssessment;
  shortageReport?: ShortageReport;
  error?: string;
}

export class AssessmentService {
  /**
   * Generates a fixed or personalized practice assessment with strict shortage checking.
   */
  static generateAssessment(
    request: AssessmentGenerationRequest,
    createdById: string = 'teacher@hindustanuniv.ac.in'
  ): AssessmentGenerationResult {
    // 1. Filter approved questions only
    let pool = store.questions.filter((q) => q.status === 'APPROVED');

    // Filter by Company if specified
    if (request.companyId) {
      pool = pool.filter((q) => q.companyIds.includes(request.companyId!));
    }

    // Filter by Subject/Topics if specified
    if (request.topicIds && request.topicIds.length > 0) {
      pool = pool.filter((q) => q.topicIds.some((t) => request.topicIds.includes(t)));
    }

    // 2. In PRACTICE mode, filter out already seen questions for this student
    if (request.mode === 'PRACTICE' && request.studentEmail) {
      const seenQuestionIds = new Set(
        store.studentHistory
          .filter((h) => h.studentEmail === request.studentEmail)
          .map((h) => h.questionId)
      );

      // Prioritize unseen questions
      pool = pool.filter((q) => !seenQuestionIds.has(q.id));
    }

    // 3. Compute target counts per difficulty based on distribution percentages
    const totalCount = request.questionCount;
    const targetEasy = Math.round((request.difficultyMix.EASY / 100) * totalCount);
    const targetHard = Math.round((request.difficultyMix.HARD / 100) * totalCount);
    const targetMed = totalCount - targetEasy - targetHard;

    const easyPool = pool.filter((q) => q.difficulty === 'EASY');
    const medPool = pool.filter((q) => q.difficulty === 'MEDIUM');
    const hardPool = pool.filter((q) => q.difficulty === 'HARD');

    // 4. Verify Shortage
    const easyShortage = Math.max(0, targetEasy - easyPool.length);
    const medShortage = Math.max(0, targetMed - medPool.length);
    const hardShortage = Math.max(0, targetHard - hardPool.length);
    const totalAvailable = easyPool.length + medPool.length + hardPool.length;
    const totalShortage = easyShortage + medShortage + hardShortage;

    if (totalShortage > 0 || totalAvailable < totalCount) {
      return {
        success: false,
        shortageReport: {
          isShortage: true,
          totalRequested: totalCount,
          totalAvailable,
          shortageCount: totalShortage > 0 ? totalShortage : totalCount - totalAvailable,
          breakdown: {
            EASY: { requested: targetEasy, available: easyPool.length, shortage: easyShortage },
            MEDIUM: { requested: targetMed, available: medPool.length, shortage: medShortage },
            HARD: { requested: targetHard, available: hardPool.length, shortage: hardShortage },
          },
        },
        error: `Insufficient approved questions in question bank. Requested ${totalCount}, but only ${totalAvailable} match criteria without repeating.`,
      };
    }

    // 5. Select unique questions without duplicates
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => 0.5 - Math.random());

    const selectedEasy = shuffle(easyPool).slice(0, targetEasy);
    const selectedMed = shuffle(medPool).slice(0, targetMed);
    const selectedHard = shuffle(hardPool).slice(0, targetHard);

    const selectedQuestions = shuffle([...selectedEasy, ...selectedMed, ...selectedHard]);
    const totalMarks =
      request.totalMarks || selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const assessmentId = 'asm-' + Date.now();
    const assessmentCode =
      'HITS-' +
      (request.mode === 'PRACTICE' ? 'PRAC' : 'FIX') +
      '-' +
      Math.random().toString(36).substring(2, 7).toUpperCase();

    const newAssessment: MockAssessment = {
      id: assessmentId,
      title: request.title,
      code: assessmentCode,
      mode: request.mode,
      status: request.mode === 'PRACTICE' ? 'PUBLISHED' : 'APPROVED',
      companyId: request.companyId,
      subjectId: request.subjectId,
      topicIds: request.topicIds,
      difficultyMix: request.difficultyMix,
      durationMinutes: request.durationMinutes,
      totalMarks,
      passMark: request.passMark || Math.round(totalMarks * 0.4),
      negativeMarkingRate: request.negativeMarkingRate || 0.25,
      questionIds: selectedQuestions.map((q) => q.id),
      assignedBatchIds: ['batch-2026'],
      windowStart: new Date().toISOString(),
      windowEnd: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days
      createdAt: new Date().toISOString(),
    };

    store.assessments.unshift(newAssessment);
    store.logAudit('GENERATE_ASSESSMENT', 'Assessment', assessmentId, createdById, {
      title: request.title,
      mode: request.mode,
      questionCount: selectedQuestions.length,
      totalMarks,
    });

    return {
      success: true,
      assessment: newAssessment,
    };
  }
}
