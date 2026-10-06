import { describe, it, expect } from 'vitest';
import { EvaluationService } from '../src/services/evaluation.service';
import { store } from '../src/lib/storage';

describe('EvaluationService', () => {
  it('should start an attempt with server-enforced expiration time', () => {
    const attempt = EvaluationService.startAttempt('asm-1', 'sp2026@student.hindustanuniv.ac.in', 'Student SP');
    expect(attempt.id).toBeDefined();
    expect(attempt.status).toBe('IN_PROGRESS');
    expect(new Date(attempt.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('should calculate correct score, deduct negative marking, and update history upon submit', () => {
    const attempt = EvaluationService.startAttempt('asm-1', 'sp2026eval@student.hindustanuniv.ac.in', 'Student SP');
    
    // Select correct option for q-1 (opt-1-2 is correct, worth 1.0)
    EvaluationService.autosave(attempt.id, 'q-1', 'opt-1-2', 15);
    // Select incorrect option for q-2 (opt-2-1 is incorrect, deducts 0.25)
    EvaluationService.autosave(attempt.id, 'q-2', 'opt-2-1', 20);

    const result = EvaluationService.submitAttempt(attempt.id, false);

    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.score).toBe(0.5); // 1.0 mark (q-1) - 0.5 negative marks (q-2)
    expect(result.negativeMarksDeducted).toBe(0.5);

    // Verify student history was updated for no-repetition
    const histQ1 = store.studentHistory.find(
      (h) => h.studentEmail === 'sp2026eval@student.hindustanuniv.ac.in' && h.questionId === 'q-1'
    );
    expect(histQ1).toBeDefined();
    expect(histQ1?.lastResult).toBe('CORRECT');
  });
});
