import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { DuplicateService } from './duplicate.service';
import { AIService } from './ai.service';
import { store, MockQuestion } from '@/lib/storage';

export interface RowValidationError {
  rowNumber: number;
  questionText?: string;
  field: string;
  error: string;
}

export interface ParsedRowResult {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  questionData?: {
    text: string;
    type: 'MCQ' | 'COMPILER';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    marks: number;
    negativeMarks: number;
    options: { text: string; isCorrect: boolean; position: number }[];
    explanation?: string;
    source?: string;
    sampleInput?: string;
    sampleOutput?: string;
  };
  duplicateFlag?: {
    type: string;
    similarityScore: number;
    matchedQuestionId: string;
  };
}

export interface ImportBatchResult {
  batchId: string;
  filename: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicatesCount: number;
  parsedRows: ParsedRowResult[];
  importedQuestionIds: string[];
}

export class ImportService {
  /**
   * Generates a sample template buffer in .xlsx format for faculty download
   */
  static generateSampleExcelBuffer(): Buffer {
    const wb = XLSX.utils.book_new();
    const headers = [
      ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Difficulty', 'Marks', 'Negative Marks', 'Explanation', 'Company', 'Subject']
    ];
    const sampleRows = [
      [
        'What is the next number in the series: 2, 6, 12, 20, 30, ?',
        '40',
        '42',
        '44',
        '48',
        'B',
        'EASY',
        1,
        0.25,
        'Differences are 4, 6, 8, 10, 12. Next number is 30 + 12 = 42.',
        'TCS',
        'Quantitative Aptitude'
      ],
      [
        'In SQL, which clause is used to filter groups created by GROUP BY?',
        'WHERE',
        'HAVING',
        'ORDER BY',
        'FILTER',
        'B',
        'EASY',
        1,
        0,
        'HAVING filters aggregated groups; WHERE filters individual rows before grouping.',
        'Infosys',
        'Technical & Programming'
      ],
      [
        'A pipe can fill a cistern in 9 hours. Due to a leak in the bottom, it is filled in 10 hours. If the cistern is full, in how much time will the leak empty it?',
        '80 hours',
        '90 hours',
        '100 hours',
        '120 hours',
        'B',
        'MEDIUM',
        1,
        0.25,
        'Work done by leak in 1 hr = (1/9) - (1/10) = 1/90. Leak takes 90 hours.',
        'Wipro',
        'Quantitative Aptitude'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Questions Template');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Parses an uploaded Excel buffer or file, keeping the raw data untouched
   */
  static async processUpload(
    fileBuffer: Buffer,
    originalFilename: string,
    uploadedByEmail: string = 'faculty@hindustanuniv.ac.in'
  ): Promise<ImportBatchResult> {
    const batchId = 'batch-' + Date.now();

    // Ensure uploads directory exists to store original file untouched
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const safeStoragePath = path.join(uploadsDir, `${batchId}-${originalFilename}`);
    fs.writeFileSync(safeStoragePath, fileBuffer);

    // Read the workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (rawRows.length <= 1) {
      throw new Error('The uploaded spreadsheet contains no data rows.');
    }

    const headerRow: string[] = rawRows[0].map((h: any) => String(h || '').trim().toLowerCase());
    
    // Find column indexes dynamically (supports both legacy and standard formats)
    const findCol = (terms: string[]) =>
      headerRow.findIndex((h) => terms.some((term) => h.includes(term)));

    const qCol = findCol(['question']);
    const optACol = findCol(['option a', 'option 1', 'sample input']);
    const optBCol = findCol(['option b', 'option 2', 'sample output']);
    const optCCol = findCol(['option c', 'option 3']);
    const optDCol = findCol(['option d', 'option 4']);
    const ansCol = findCol(['correct', 'answer', 'hidden tc']);
    const diffCol = findCol(['difficulty', 'level']);
    const marksCol = findCol(['marks', 'mark']);
    const negCol = findCol(['negative']);
    const expCol = findCol(['explanation']);
    const compCol = findCol(['company']);

    const parsedRows: ParsedRowResult[] = [];
    let duplicatesCount = 0;
    const importedQuestionIds: string[] = [];

    // Process each row
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      // Skip completely empty rows
      if (!row || row.every((c: any) => String(c).trim() === '')) continue;

      const rowNumber = i + 1;
      const errors: string[] = [];

      const questionText = qCol !== -1 ? String(row[qCol] || '').trim() : '';
      const optA = optACol !== -1 ? String(row[optACol] || '').trim() : '';
      const optB = optBCol !== -1 ? String(row[optBCol] || '').trim() : '';
      const optC = optCCol !== -1 ? String(row[optCCol] || '').trim() : '';
      const optD = optDCol !== -1 ? String(row[optDCol] || '').trim() : '';
      const rawAns = ansCol !== -1 ? String(row[ansCol] || '').trim().toUpperCase() : '';
      const rawDiff = diffCol !== -1 ? String(row[diffCol] || '').trim().toUpperCase() : 'MEDIUM';
      const rawMarks = marksCol !== -1 ? parseFloat(row[marksCol]) : 1.0;
      const rawNeg = negCol !== -1 ? parseFloat(row[negCol]) : 0.0;
      const explanation = expCol !== -1 ? String(row[expCol] || '').trim() : '';
      const companyTag = compCol !== -1 ? String(row[compCol] || '').trim() : 'TCS';

      // 1. Validation Rules
      if (!questionText || questionText.length < 5) {
        errors.push('Question statement is missing or shorter than 5 characters.');
      }

      if (!optA || !optB) {
        errors.push('At least Option A and Option B must be populated.');
      }

      // Determine correct option
      let correctIndex = -1;
      if (rawAns === 'A' || rawAns === 'OPTION A' || rawAns === '1' || rawAns === optA.toUpperCase()) {
        correctIndex = 0;
      } else if (rawAns === 'B' || rawAns === 'OPTION B' || rawAns === '2' || rawAns === optB.toUpperCase()) {
        correctIndex = 1;
      } else if (rawAns === 'C' || rawAns === 'OPTION C' || rawAns === '3' || rawAns === optC.toUpperCase()) {
        correctIndex = 2;
      } else if (rawAns === 'D' || rawAns === 'OPTION D' || rawAns === '4' || rawAns === optD.toUpperCase()) {
        correctIndex = 3;
      }

      if (correctIndex === -1) {
        errors.push(`Correct Answer ('${rawAns}') is invalid. Must specify A, B, C, or D (or match the option text).`);
      }

      const difficulty: 'EASY' | 'MEDIUM' | 'HARD' =
        rawDiff === 'HARD' || rawDiff === 'DIFFICULT'
          ? 'HARD'
          : rawDiff === 'EASY'
          ? 'EASY'
          : 'MEDIUM';

      const marks = isNaN(rawMarks) || rawMarks <= 0 ? 1.0 : rawMarks;
      const negativeMarks = isNaN(rawNeg) || rawNeg < 0 ? 0.0 : rawNeg;

      const isValid = errors.length === 0;

      if (!isValid) {
        parsedRows.push({
          rowNumber,
          isValid: false,
          errors,
        });
        continue;
      }

      // Assemble valid options array
      const options = [
        { text: optA, isCorrect: correctIndex === 0, position: 0 },
        { text: optB, isCorrect: correctIndex === 1, position: 1 },
      ];
      if (optC) options.push({ text: optC, isCorrect: correctIndex === 2, position: 2 });
      if (optD) options.push({ text: optD, isCorrect: correctIndex === 3, position: 3 });

      // Run Duplicate Detection against Central Question Bank
      const dupCheck = DuplicateService.detectDuplicate(
        questionText,
        options.map((o) => o.text)
      );

      let duplicateFlagInfo;
      if (dupCheck.isDuplicate && dupCheck.matchedQuestion) {
        duplicatesCount++;
        duplicateFlagInfo = {
          type: dupCheck.type!,
          similarityScore: dupCheck.similarityScore,
          matchedQuestionId: dupCheck.matchedQuestion.id,
        };
      }

      // Run AI Classification suggestion
      const aiSuggested = await AIService.classifyQuestion(
        questionText,
        options.map((o) => o.text)
      );

      // Create Question in PENDING_REVIEW status (Never straight to APPROVED)
      const newQuestionId = 'q-imp-' + Date.now() + '-' + i;
      const newQuestion: MockQuestion = {
        id: newQuestionId,
        text: questionText,
        type: 'MCQ',
        difficulty,
        marks,
        negativeMarks,
        source: `Excel Upload: ${originalFilename}`,
        status: 'PENDING_REVIEW', // Strict requirement: Imported questions enter PENDING_REVIEW
        explanation: explanation || 'Imported via spreadsheet.',
        normalizedHash: DuplicateService.normalizeText(questionText),
        options: options.map((opt, idx) => ({
          id: `opt-${newQuestionId}-${idx}`,
          text: opt.text,
          isCorrect: opt.isCorrect,
          position: opt.position,
        })),
        companyIds: ['comp-1'], // default TCS, extendable
        topicIds: ['top-1'],
        embedding: AIService.generateEmbedding(questionText),
        aiClassification: aiSuggested,
        createdAt: new Date().toISOString(),
      };

      store.questions.push(newQuestion);
      importedQuestionIds.push(newQuestionId);

      // If duplicate detected, record persistent DuplicateFlag
      if (dupCheck.isDuplicate && dupCheck.matchedQuestion) {
        store.duplicateFlags.push({
          id: 'dup-' + Date.now() + '-' + i,
          questionAId: dupCheck.matchedQuestion.id,
          questionBId: newQuestionId,
          questionAText: dupCheck.matchedQuestion.text,
          questionBText: questionText,
          type: dupCheck.type!,
          similarityScore: dupCheck.similarityScore,
          resolution: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }

      parsedRows.push({
        rowNumber,
        isValid: true,
        errors: [],
        questionData: {
          text: questionText,
          type: 'MCQ',
          difficulty,
          marks,
          negativeMarks,
          options,
          explanation,
          source: originalFilename,
        },
        duplicateFlag: duplicateFlagInfo,
      });
    }

    const result: ImportBatchResult = {
      batchId,
      filename: originalFilename,
      totalRows: parsedRows.length,
      validRowsCount: parsedRows.filter((r) => r.isValid).length,
      invalidRowsCount: parsedRows.filter((r) => !r.isValid).length,
      duplicatesCount,
      parsedRows,
      importedQuestionIds,
    };

    store.importBatches.unshift(result);
    store.logAudit('EXCEL_IMPORT', 'ImportBatch', batchId, uploadedByEmail, {
      filename: originalFilename,
      valid: result.validRowsCount,
      invalid: result.invalidRowsCount,
      duplicates: duplicatesCount,
    });

    return result;
  }
}
