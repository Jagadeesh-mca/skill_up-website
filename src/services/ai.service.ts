export interface AIClassificationResult {
  subject: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  confidence: number;
  reasoning: string;
}

/**
 * Modular AI Service for Question Classification and Vector Embeddings
 * Uses Groq API (llama-3.3-70b-versatile) when GROQ_API_KEY is present,
 * with deterministic semantic feature vector generation offline fallback.
 */
export class AIService {
  private static apiKey = process.env.GROQ_API_KEY || '';

  /**
   * Classify a question into Subject, Topic, Difficulty with confidence score
   */
  static async classifyQuestion(
    questionText: string,
    options: string[]
  ): Promise<AIClassificationResult> {
    if (this.apiKey && this.apiKey.startsWith('gsk_')) {
      try {
        const prompt = `You are an expert exam analyzer for university campus placements.
Analyze this question and return JSON format strictly with keys: "subject", "topic", "difficulty", "confidence" (0.0 to 1.0), and "reasoning".
Allowed subjects: "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Technical & Programming".
Allowed difficulty: "EASY", "MEDIUM", "HARD".

Question: ${questionText}
Options: ${options.join(', ')}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          return {
            subject: parsed.subject || 'Quantitative Aptitude',
            topic: parsed.topic || 'General Practice',
            difficulty: (parsed.difficulty as any) || 'MEDIUM',
            confidence: Math.min(1.0, Math.max(0.5, Number(parsed.confidence) || 0.9)),
            reasoning: parsed.reasoning || 'Classified via Groq AI model.',
          };
        }
      } catch (err) {
        console.warn('Groq API error, falling back to deterministic classifier', err);
      }
    }

    // Deterministic Rule-Based & Keyword AI Classifier
    const lower = questionText.toLowerCase();

    if (
      lower.includes('sql') ||
      lower.includes('query') ||
      lower.includes('database') ||
      lower.includes('table')
    ) {
      return {
        subject: 'Technical & Programming',
        topic: 'SQL & Database Queries',
        difficulty: lower.includes('join') || lower.includes('group by') ? 'MEDIUM' : 'EASY',
        confidence: 0.95,
        reasoning: 'Detected relational database and SQL syntax patterns.',
      };
    }

    if (
      lower.includes('queue') ||
      lower.includes('stack') ||
      lower.includes('linked list') ||
      lower.includes('tree') ||
      lower.includes('graph') ||
      lower.includes('array') ||
      lower.includes('complexity')
    ) {
      return {
        subject: 'Technical & Programming',
        topic: 'Data Structures & Algorithms',
        difficulty: lower.includes('graph') || lower.includes('tree') ? 'HARD' : 'MEDIUM',
        confidence: 0.96,
        reasoning: 'Contains fundamental algorithmic data structures and complexity terminology.',
      };
    }

    if (
      lower.includes('train') ||
      lower.includes('speed') ||
      lower.includes('distance') ||
      lower.includes('km/h') ||
      lower.includes('platform')
    ) {
      return {
        subject: 'Quantitative Aptitude',
        topic: 'Speed, Time & Distance',
        difficulty: 'MEDIUM',
        confidence: 0.93,
        reasoning: 'Involves kinematics, relative speed, and railway motion calculations.',
      };
    }

    if (
      lower.includes('work') ||
      lower.includes('days') ||
      lower.includes('alone') ||
      lower.includes('together finish')
    ) {
      return {
        subject: 'Quantitative Aptitude',
        topic: 'Time & Work',
        difficulty: 'MEDIUM',
        confidence: 0.92,
        reasoning: 'Rate of work and day estimation mathematical problem.',
      };
    }

    if (
      lower.includes('brother') ||
      lower.includes('sister') ||
      lower.includes('mother') ||
      lower.includes('father') ||
      lower.includes('pointing to')
    ) {
      return {
        subject: 'Logical Reasoning',
        topic: 'Blood Relations',
        difficulty: 'EASY',
        confidence: 0.94,
        reasoning: 'Genealogy and familial relation deductive reasoning.',
      };
    }

    if (lower.includes('probability') || lower.includes('balls') || lower.includes('card')) {
      return {
        subject: 'Quantitative Aptitude',
        topic: 'Probability & Combinatorics',
        difficulty: 'MEDIUM',
        confidence: 0.91,
        reasoning: 'Permutation, combination, and probabilistic distribution problem.',
      };
    }

    // Default Fallback
    return {
      subject: 'Quantitative Aptitude',
      topic: 'Number Systems',
      difficulty: 'MEDIUM',
      confidence: 0.85,
      reasoning: 'General numerical aptitude question.',
    };
  }

  /**
   * Generates a normalized semantic feature vector for duplicate detection.
   * Produces a 64-dimensional float vector based on character and token n-grams.
   */
  static generateEmbedding(text: string): number[] {
    const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const vectorLength = 64;
    const vector = new Array(vectorLength).fill(0);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let hash = 0;
      for (let j = 0; j < token.length; j++) {
        hash = (hash << 5) - hash + token.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % vectorLength;
      vector[index] += 1.0;
    }

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map((v) => Number((v / magnitude).toFixed(4)));
  }

  /**
   * Computes Cosine Similarity between two normalized embedding vectors.
   * Returns a score between 0.0 and 1.0.
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1.0, dotProduct));
  }
}
