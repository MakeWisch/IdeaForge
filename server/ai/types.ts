/**
 * Provider-agnostic AI types and interfaces for IdeaForge.
 */

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}

export interface GenerateStructuredOutputOptions extends GenerateTextOptions {
  schemaDescription?: string;
}

export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;
  generateText(options: GenerateTextOptions): Promise<string>;
  generateStructuredOutput<T>(options: GenerateStructuredOutputOptions): Promise<T>;
}

export type TaskType = 
  | 'analyze_idea'
  | 'stress_test'
  | 'generate_alternatives'
  | 'prototype_plan'
  | 'challenge_concern'
  | 'summarize_idea';

export interface NormalizedAIRequest {
  task: TaskType;
  input: string;
  context?: Record<string, any>;
  preferredProvider?: string;
}

export interface NormalizedAIResponse<T = any> {
  success: boolean;
  task: TaskType;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly isTransient: boolean = false,
    public readonly isAuthError: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
