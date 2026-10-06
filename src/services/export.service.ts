import * as XLSX from 'xlsx';
import { store, MockQuestion, MockAttempt } from '@/lib/storage';

export class ExportService {
  /**
   * Exports the entire or filtered Central Question Bank into an Excel workbook
   */
  static exportQuestionBankToExcel(statusFilter?: string): Buffer {
    const questions = statusFilter
      ? store.questions.filter((q) => q.status === statusFilter)
      : store.questions;

    const rows = questions.map((q, idx) => {
      const optA = q.options[0]?.text || '';
      const optB = q.options[1]?.text || '';
      const optC = q.options[2]?.text || '';
      const optD = q.options[3]?.text || '';
      const correctOpt = q.options.find((o) => o.isCorrect);
      const correctLetter = correctOpt
        ? ['A', 'B', 'C', 'D'][correctOpt.position] || correctOpt.text
        : '';

      const companyNames = q.companyIds
        .map((cId) => store.companies.find((c) => c.id === cId)?.name)
        .filter(Boolean)
        .join(', ');

      const topicName =
        store.topics.find((t) => t.id === q.topicIds[0])?.name || 'General';

      return {
        'S.No': idx + 1,
        'Question ID': q.id,
        'Question Text': q.text,
        'Option A': optA,
        'Option B': optB,
        'Option C': optC,
        'Option D': optD,
        'Correct Answer': correctLetter,
        Difficulty: q.difficulty,
        Marks: q.marks,
        'Negative Marks': q.negativeMarks,
        Status: q.status,
        Company: companyNames || 'General',
        Topic: topicName,
        Explanation: q.explanation || '',
        Source: q.source || 'Hindustan University Bank',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Question Bank');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Exports student assessment results to Excel
   */
  static exportAssessmentResultsToExcel(assessmentId: string): Buffer {
    const assessment = store.assessments.find((a) => a.id === assessmentId);
    const attempts = Object.values(store.attempts).filter(
      (att) => att.assessmentId === assessmentId
    );

    const rows = attempts.map((att, idx) => ({
      Rank: idx + 1,
      'Student Name': att.studentName,
      'Student Email': att.studentEmail,
      Status: att.status,
      Score: att.score,
      'Total Marks': att.totalMarks,
      'Percentage (%)': att.percentage,
      Result: att.passed ? 'PASS' : 'FAIL',
      'Accuracy (%)': att.accuracy,
      'Started At': att.startedAt,
      'Submitted At': att.submittedAt || 'N/A',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Message: 'No attempts submitted yet' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
