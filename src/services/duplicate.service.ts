import { AIService } from './ai.service';
import { MockQuestion, store } from '@/lib/storage';

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  type?: 'EXACT' | 'FORMAT' | 'REORDERED' | 'SEMANTIC';
  matchedQuestion?: MockQuestion;
  similarityScore: number;
  reason?: string;
}

export class DuplicateService {
  /**
   * Normalizes text for exact and formatting deduplication:
   * Strips all punctuation, replaces multiple whitespaces with single space, converts to lowercase.
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/(\d+)\s*([a-zA-Z]+)/g, '$1 $2')
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Checks an incoming question against all approved questions in the central repository.
   * Multi-Tier check:
   * Tier 1: Exact / Format match (Normalized text equality)
   * Tier 2: Reordered Options duplicate (Exact or near question text with same option sets in different order)
   * Tier 3: Semantic Similarity (Embedding cosine similarity >= 0.88)
   */
  static detectDuplicate(
    incomingText: string,
    incomingOptions: string[],
    existingQuestions: MockQuestion[] = store.questions
  ): DuplicateDetectionResult {
    const normIncoming = this.normalizeText(incomingText);
    const normIncomingOptionsSet = new Set(incomingOptions.map((o) => this.normalizeText(o)));
    const incomingEmbedding = AIService.generateEmbedding(incomingText);

    for (const existing of existingQuestions) {
      const normExisting = this.normalizeText(existing.text);

      // Tier 1: Exact or Format Variation
      if (normIncoming === normExisting) {
        return {
          isDuplicate: true,
          type: incomingText.trim() === existing.text.trim() ? 'EXACT' : 'FORMAT',
          matchedQuestion: existing,
          similarityScore: 1.0,
          reason: 'Identical normalized question text found in central repository.',
        };
      }

      // Tier 2: Reordered Options Check
      if (existing.options && existing.options.length > 0 && incomingOptions.length > 0) {
        const normExistingOptionsSet = new Set(existing.options.map((o) => this.normalizeText(o.text)));
        let matchingOptionsCount = 0;
        normIncomingOptionsSet.forEach((opt) => {
          if (normExistingOptionsSet.has(opt)) matchingOptionsCount++;
        });

        const optionOverlapRatio =
          matchingOptionsCount / Math.max(normIncomingOptionsSet.size, normExistingOptionsSet.size);

        if (optionOverlapRatio >= 0.75) {
          const textSimilarity = AIService.cosineSimilarity(
            incomingEmbedding,
            existing.embedding || AIService.generateEmbedding(existing.text)
          );

          if (textSimilarity >= 0.75) {
            return {
              isDuplicate: true,
              type: 'REORDERED',
              matchedQuestion: existing,
              similarityScore: Number(textSimilarity.toFixed(2)),
              reason: 'Same question with rearranged or permuted multiple choice options.',
            };
          }
        }
      }

      // Tier 3: Semantic Similarity Check (pgvector / embedding cosine >= 0.88)
      const existingEmbedding =
        existing.embedding && existing.embedding.length > 0
          ? existing.embedding
          : AIService.generateEmbedding(existing.text);

      const cosineSim = AIService.cosineSimilarity(incomingEmbedding, existingEmbedding);

      if (cosineSim >= 0.88) {
        return {
          isDuplicate: true,
          type: 'SEMANTIC',
          matchedQuestion: existing,
          similarityScore: Number(cosineSim.toFixed(2)),
          reason: `High semantic similarity (${Math.round(cosineSim * 100)}%) detected via vector embedding.`,
        };
      }
    }

    return {
      isDuplicate: false,
      similarityScore: 0,
    };
  }

  /**
   * Resolves a flagged duplicate:
   * - KEPT_BOTH: Marks both as valid distinct questions.
   * - MERGED: Links company/topic tags to existing question and rejects incoming duplicate.
   * - REJECTED: Discards the incoming duplicate question.
   */
  static resolveFlag(
    flagId: string,
    action: 'KEPT_BOTH' | 'MERGED' | 'REJECTED',
    resolvedByEmail: string = 'faculty@hindustanuniv.ac.in'
  ): { success: boolean; message: string } {
    const flag = store.duplicateFlags.find((f) => f.id === flagId);
    if (!flag) return { success: false, message: 'Duplicate flag record not found.' };

    flag.resolution = action;

    if (action === 'MERGED') {
      const qA = store.questions.find((q) => q.id === flag.questionAId);
      const qB = store.questions.find((q) => q.id === flag.questionBId);
      if (qA && qB) {
        // Merge companies without duplicate entries
        qA.companyIds = Array.from(new Set([...qA.companyIds, ...qB.companyIds]));
        qA.topicIds = Array.from(new Set([...qA.topicIds, ...qB.topicIds]));
        qB.status = 'REJECTED';
      }
    } else if (action === 'REJECTED') {
      const qB = store.questions.find((q) => q.id === flag.questionBId);
      if (qB) qB.status = 'REJECTED';
    }

    store.logAudit('RESOLVE_DUPLICATE', 'DuplicateFlag', flagId, resolvedByEmail, {
      resolution: action,
      questionA: flag.questionAId,
      questionB: flag.questionBId,
    });

    return { success: true, message: `Duplicate flag resolved as ${action}.` };
  }
}
