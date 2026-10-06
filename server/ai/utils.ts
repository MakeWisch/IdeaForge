/**
 * Utility helpers for JSON extraction, retries, and error handling.
 */

export function extractJsonFromText(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Received empty text from AI provider');
  }

  const trimmed = rawText.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {
    // Proceed to extraction below
  }

  // Look for ```json ... ``` blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue searching
    }
  }

  // Find first { and last } or first [ and last ]
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue
    }
  }

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue
    }
  }

  throw new Error(`Failed to parse structured JSON from provider output: ${trimmed.slice(0, 160)}...`);
}

/**
 * Execute a function with exponential backoff for transient errors
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    isTransient?: (err: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelayMs = 600,
    maxDelayMs = 4000,
    isTransient = (err: any) => Boolean(err?.isTransient)
  } = options;

  let delay = initialDelayMs;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries || !isTransient(err)) {
        throw err;
      }

      await new Promise(resolve => setTimeout(resolve, Math.min(delay, maxDelayMs)));
      delay *= 2;
    }
  }
}
