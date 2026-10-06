import { AIProvider, GenerateTextOptions, GenerateStructuredOutputOptions, AIProviderError } from "../types";
import { extractJsonFromText, withExponentialBackoff } from "../utils";

export class OpenAIProvider implements AIProvider {
  public readonly name = "openai";
  public readonly defaultModel = "gpt-4o-mini";
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.baseUrl = baseUrl;
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new AIProviderError(
        "OpenAI API key is not configured. Please set OPENAI_API_KEY in your server environment or .env file.",
        this.name,
        401,
        false,
        true
      );
    }
  }

  public async generateText(options: GenerateTextOptions): Promise<string> {
    this.ensureApiKey();
    const model = options.model || process.env.AI_MODEL || this.defaultModel;

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: options.prompt });

    return withExponentialBackoff(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.7,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || response.statusText;
          throw this.translateHttpError(response.status, errMsg);
        }

        const data: any = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text) {
          throw new AIProviderError("Empty response returned from OpenAI", this.name, 500, true);
        }
        return text;
      } catch (err: any) {
        if (err instanceof AIProviderError) throw err;
        throw new AIProviderError(`OpenAI network/fetch error: ${err.message}`, this.name, 500, true);
      }
    });
  }

  public async generateStructuredOutput<T>(options: GenerateStructuredOutputOptions): Promise<T> {
    this.ensureApiKey();
    const model = options.model || process.env.AI_MODEL || this.defaultModel;

    const systemPrompt = [
      options.systemInstruction || "You are an expert engineering architect.",
      "You MUST respond ONLY with valid JSON matching the user's requested specification. Do NOT include markdown code blocks, conversational text, or commentary outside the JSON."
    ].join("\n");

    const userPrompt = options.schemaDescription
      ? `${options.prompt}\n\nREQUIRED JSON SCHEMA:\n${options.schemaDescription}`
      : options.prompt;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    return withExponentialBackoff(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: "json_object" },
            temperature: options.temperature ?? 0.7,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || response.statusText;
          throw this.translateHttpError(response.status, errMsg);
        }

        const data: any = await response.json();
        const content = data?.choices?.[0]?.message?.content || "";
        return extractJsonFromText(content) as T;
      } catch (err: any) {
        if (err instanceof AIProviderError) throw err;
        throw new AIProviderError(`OpenAI network/fetch error: ${err.message}`, this.name, 500, true);
      }
    });
  }

  private translateHttpError(status: number, message: string): AIProviderError {
    const isAuth = status === 401 || status === 403;
    const isRateLimit = status === 429;
    const isTransient = isRateLimit || status === 500 || status === 502 || status === 503 || status === 504;

    return new AIProviderError(
      `OpenAI error (${status}): ${message}`,
      this.name,
      status,
      isTransient,
      isAuth
    );
  }
}
