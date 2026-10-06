import { describe, it, expect } from 'vitest';
import { DuplicateService } from '../src/services/duplicate.service';
import { MockQuestion } from '../src/lib/storage';

describe('DuplicateService', () => {
  const existingQuestions: MockQuestion[] = [
    {
      id: 'q-exist-1',
      text: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
      type: 'MCQ',
      difficulty: 'EASY',
      marks: 1,
      negativeMarks: 0.25,
      source: 'Central Bank',
      status: 'APPROVED',
      explanation: '',
      normalizedHash: 'atrain240mlongpassesapolein24secondshowlongwillittaketo passaplatform650mlong',
      options: [
        { id: '1', text: '65 seconds', isCorrect: false, position: 0 },
        { id: '2', text: '89 seconds', isCorrect: true, position: 1 },
        { id: '3', text: '100 seconds', isCorrect: false, position: 2 },
        { id: '4', text: '150 seconds', isCorrect: false, position: 3 },
      ],
      companyIds: ['comp-1'],
      topicIds: ['top-3'],
      embedding: [0.12, 0.45, 0.88, 0.23],
      createdAt: new Date().toISOString(),
    },
  ];

  it('Tier 1: should detect exact identical questions', () => {
    const incomingText = 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?';
    const result = DuplicateService.detectDuplicate(incomingText, ['65 seconds', '89 seconds'], existingQuestions);
    expect(result.isDuplicate).toBe(true);
    expect(result.type).toBe('EXACT');
    expect(result.similarityScore).toBe(1.0);
  });

  it('Tier 1: should detect format duplicate (different casing and punctuation)', () => {
    const incomingText = '  A train 240m long, passes a pole in 24 seconds! How long will it take to pass a platform 650m long?  ';
    const result = DuplicateService.detectDuplicate(incomingText, ['65s', '89s'], existingQuestions);
    expect(result.isDuplicate).toBe(true);
    expect(result.similarityScore).toBe(1.0);
  });

  it('Tier 2: should detect reordered options duplicate', () => {
    const incomingText = 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?';
    // Options reordered: Option 89s moved to position 0 instead of 1
    const reorderedOptions = ['89 seconds', '150 seconds', '65 seconds', '100 seconds'];
    const result = DuplicateService.detectDuplicate(incomingText, reorderedOptions, existingQuestions);
    expect(result.isDuplicate).toBe(true);
  });

  it('should return false for genuinely distinct questions', () => {
    const distinctText = 'In a class of 60 students, the ratio of boys to girls is 3:2. Find the number of girls.';
    const result = DuplicateService.detectDuplicate(distinctText, ['24', '36', '40'], existingQuestions);
    expect(result.isDuplicate).toBe(false);
  });
});
