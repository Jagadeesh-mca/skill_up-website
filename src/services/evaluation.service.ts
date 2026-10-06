import { store, MockAttempt, MockQuestion } from '@/lib/storage';

export interface EvaluationResult {
  attemptId: string;
  totalQuestions: number;
  attemptedCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  totalMarks: number;
  score: number;
  negativeMarksDeducted: number;
  percentage: number;
  passed: boolean;
  accuracy: number;
  topicBreakdown: Record<string, { topicName: string; total: number; correct: number; accuracy: number }>;
  difficultyBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
}

export class EvaluationService {
  /**
   * Starts an assessment attempt, setting a strict server-enforced deadline.
   */
  static startAttempt(
    assessmentId: string,
    studentEmail: string,
    studentName: string
  ): MockAttempt {
    const assessment = store.assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    const attemptId = 'att-' + Date.now();
    const durationMs = assessment.durationMinutes * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    const attempt: MockAttempt = {
      id: attemptId,
      assessmentId,
      studentEmail,
      studentName,
      startedAt: new Date().toISOString(),
      expiresAt,
      status: 'IN_PROGRESS',
      score: 0,
      totalMarks: assessment.totalMarks,
      percentage: 0,
      passed: false,
      accuracy: 0,
      answers: {},
    };

    store.attempts[attemptId] = attempt;
    return attempt;
  }

  /**
   * Autosaves student answers periodically
   */
  static autosave(
    attemptId: string,
    questionId: string,
    selectedOptionId?: string,
    timeSpentSeconds?: number,
    isFlagged?: boolean
  ): boolean {
    const attempt = store.attempts[attemptId];
    if (!attempt || attempt.status !== 'IN_PROGRESS') return false;

    // Check server deadline
    if (new Date() > new Date(attempt.expiresAt)) {
      this.submitAttempt(attemptId, true);
      return false;
    }

    if (!attempt.answers[questionId]) {
      attempt.answers[questionId] = {};
    }

    if (selectedOptionId !== undefined) {
      attempt.answers[questionId].selectedOptionId = selectedOptionId;
    }
    if (timeSpentSeconds !== undefined) {
      attempt.answers[questionId].timeSpentSeconds =
        (attempt.answers[questionId].timeSpentSeconds || 0) + timeSpentSeconds;
    }
    if (isFlagged !== undefined) {
      attempt.answers[questionId].isFlagged = isFlagged;
    }

    return true;
  }

  /**
   * Submits and automatically evaluates an attempt with negative marking and analytics tracking
   */
  static submitAttempt(attemptId: string, isTimeout: boolean = false): EvaluationResult {
    const attempt = store.attempts[attemptId];
    if (!attempt) throw new Error('Attempt not found');

    const assessment = store.assessments.find((a) => a.id === attempt.assessmentId);
    if (!assessment) throw new Error('Associated assessment not found');

    const questionList: MockQuestion[] = assessment.questionIds
      .map((qId) => store.questions.find((q) => q.id === qId))
      .filter(Boolean) as MockQuestion[];

    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;
    let rawScore = 0;
    let negativeDeducted = 0;

    const topicMap: Record<string, { topicName: string; total: number; correct: number; accuracy: number }> = {};
    const diffMap: Record<string, { total: number; correct: number; accuracy: number }> = {
      EASY: { total: 0, correct: 0, accuracy: 0 },
      MEDIUM: { total: 0, correct: 0, accuracy: 0 },
      HARD: { total: 0, correct: 0, accuracy: 0 },
    };

    for (const q of questionList) {
      const studentAns = attempt.answers[q.id];
      const selectedOptId = studentAns?.selectedOptionId;

      // Track difficulty count
      diffMap[q.difficulty].total++;

      // Track topic count
      const topicId = q.topicIds[0] || 'top-1';
      const topicObj = store.topics.find((t) => t.id === topicId);
      const topicName = topicObj?.name || 'General';

      if (!topicMap[topicId]) {
        topicMap[topicId] = { topicName, total: 0, correct: 0, accuracy: 0 };
      }
      topicMap[topicId].total++;

      // Check correctness
      let isCorrect = false;
      if (selectedOptId) {
        attemptedCount++;
        const correctOpt = q.options.find((o) => o.isCorrect);
        isCorrect = correctOpt ? correctOpt.id === selectedOptId : false;

        if (isCorrect) {
          correctCount++;
          rawScore += q.marks || 1.0;
          diffMap[q.difficulty].correct++;
          topicMap[topicId].correct++;
          if (studentAns) {
            studentAns.isCorrect = true;
            studentAns.marksAwarded = q.marks || 1.0;
          }
        } else {
          incorrectCount++;
          const neg = q.negativeMarks || assessment.negativeMarkingRate || 0.25;
          negativeDeducted += neg;
          if (studentAns) {
            studentAns.isCorrect = false;
            studentAns.marksAwarded = -neg;
          }
        }
      }

      // Update student_question_history (Seen question tracking for no-repetition)
      const existingHist = store.studentHistory.find(
        (h) => h.studentEmail === attempt.studentEmail && h.questionId === q.id
      );

      if (existingHist) {
        existingHist.timesSeen++;
        existingHist.lastResult = selectedOptId ? (isCorrect ? 'CORRECT' : 'INCORRECT') : 'SKIPPED';
      } else {
        store.studentHistory.push({
          studentEmail: attempt.studentEmail,
          questionId: q.id,
          firstSeenAt: new Date().toISOString(),
          timesSeen: 1,
          lastResult: selectedOptId ? (isCorrect ? 'CORRECT' : 'INCORRECT') : 'SKIPPED',
        });
      }

      // Update student_topic_stats (Rolling topic accuracy for weak-area detection)
      const topicStatKey = `${attempt.studentEmail}_${topicId}`;
      let stat = store.studentTopicStats[topicStatKey];
      if (!stat) {
        stat = {
          studentEmail: attempt.studentEmail,
          topicId,
          totalAttempted: 0,
          totalCorrect: 0,
          accuracyPercentage: 0,
          avgTimeSpentSeconds: 0,
        };
        store.studentTopicStats[topicStatKey] = stat;
      }

      if (selectedOptId) {
        stat.totalAttempted++;
        if (isCorrect) stat.totalCorrect++;
        stat.accuracyPercentage = Math.round((stat.totalCorrect / stat.totalAttempted) * 100);
      }
    }

    // Final score after negative marks
    const finalScore = Math.max(0, Number((rawScore - negativeDeducted).toFixed(2)));
    const percentage = Number(((finalScore / assessment.totalMarks) * 100).toFixed(1));
    const passed = finalScore >= assessment.passMark;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    // Calculate accuracy percentages for breakdowns
    Object.values(diffMap).forEach((d) => {
      d.accuracy = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
    });
    Object.values(topicMap).forEach((t) => {
      t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    });

    attempt.status = isTimeout ? 'TIMEOUT_SUBMITTED' : 'SUBMITTED';
    attempt.submittedAt = new Date().toISOString();
    attempt.score = finalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.accuracy = accuracy;

    store.logAudit('SUBMIT_ASSESSMENT', 'Attempt', attemptId, attempt.studentEmail, {
      score: finalScore,
      percentage,
      passed,
      isTimeout,
    });

    return {
      attemptId,
      totalQuestions: questionList.length,
      attemptedCount,
      unansweredCount: questionList.length - attemptedCount,
      correctCount,
      incorrectCount,
      totalMarks: assessment.totalMarks,
      score: finalScore,
      negativeMarksDeducted: Number(negativeDeducted.toFixed(2)),
      percentage,
      passed,
      accuracy,
      topicBreakdown: topicMap,
      difficultyBreakdown: diffMap,
    };
  }
}
