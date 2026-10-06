import { GoogleGenAI } from "@google/genai";
import { AIProvider, GenerateTextOptions, GenerateStructuredOutputOptions, AIProviderError } from "../types";
import { extractJsonFromText, withExponentialBackoff } from "../utils";

export class GeminiProvider implements AIProvider {
  public readonly name = "gemini";
  public readonly defaultModel = "gemini-3.8-flash";
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    if (this.apiKey) {
      this.client = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }

  private ensureClient(): GoogleGenAI {
    if (!this.client || !this.apiKey) {
      throw new AIProviderError(
        "Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment or .env file.",
        this.name,
        401,
        false,
        true
      );
    }
    return this.client;
  }

  public async generateText(options: GenerateTextOptions): Promise<string> {
    const client = this.ensureClient();
    const model = options.model || process.env.AI_MODEL || this.defaultModel;

    return withExponentialBackoff(async () => {
      try {
        const response = await client.models.generateContent({
          model,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.7,
          }
        });

        const text = response.text;
        if (!text) {
          throw new AIProviderError("Empty response returned from Gemini", this.name, 500, true);
        }
        return text;
      } catch (err: any) {
        throw this.translateError(err);
      }
    });
  }

  public async generateStructuredOutput<T>(options: GenerateStructuredOutputOptions): Promise<T> {
    const client = this.ensureClient();
    const model = options.model || process.env.AI_MODEL || this.defaultModel;

    const schemaPrompt = options.schemaDescription 
      ? `\n\nOUTPUT FORMAT: You must respond with valid JSON strictly adhering to this schema:\n${options.schemaDescription}\nRespond with JSON only, without conversational preamble or closing remarks.`
      : '\n\nOUTPUT FORMAT: You must respond with valid JSON only.';

    const fullPrompt = `${options.prompt}${schemaPrompt}`;

    return withExponentialBackoff(async () => {
      try {
        const response = await client.models.generateContent({
          model,
          contents: fullPrompt,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.7,
            responseMimeType: "application/json",
          }
        });

        const text = response.text || "";
        return extractJsonFromText(text) as T;
      } catch (err: any) {
        throw this.translateError(err);
      }
    });
  }

  private translateError(err: any): AIProviderError {
    if (err instanceof AIProviderError) return err;

    const message = err?.message || String(err);
    const status = err?.status || err?.statusCode || 500;

    const isAuth = status === 401 || status === 403 || message.includes("API_KEY_INVALID") || message.includes("API key not valid");
    const isRateLimit = status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota");
    const isTransient = isRateLimit || status === 503 || status === 500 || message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand") || message.includes("overloaded") || message.includes("fetch failed");

    return new AIProviderError(
      `Gemini provider error: ${message}`,
      this.name,
      status,
      isTransient,
      isAuth
    );
  }
}
