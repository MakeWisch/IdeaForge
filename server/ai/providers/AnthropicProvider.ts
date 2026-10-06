import { AIProvider, GenerateTextOptions, GenerateStructuredOutputOptions, AIProviderError } from "../types";
import { extractJsonFromText, withExponentialBackoff } from "../utils";

export class AnthropicProvider implements AIProvider {
  public readonly name = "anthropic";
  public readonly defaultModel = "claude-3-5-sonnet-20241022";
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl = "https://api.anthropic.com/v1") {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.baseUrl = baseUrl;
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new AIProviderError(
        "Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your server environment or .env file.",
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

    return withExponentialBackoff(async () => {
      try {
        const body: Record<string, any> = {
          model,
          max_tokens: 4096,
          messages: [{ role: "user", content: options.prompt }],
          temperature: options.temperature ?? 0.7,
        };

        if (options.systemInstruction) {
          body.system = options.systemInstruction;
        }

        const response = await fetch(`${this.baseUrl}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || response.statusText;
          throw this.translateHttpError(response.status, errMsg);
        }

        const data: any = await response.json();
        const text = data?.content?.[0]?.text;
        if (!text) {
          throw new AIProviderError("Empty response returned from Anthropic", this.name, 500, true);
        }
        return text;
      } catch (err: any) {
        if (err instanceof AIProviderError) throw err;
        throw new AIProviderError(`Anthropic network/fetch error: ${err.message}`, this.name, 500, true);
      }
    });
  }

  public async generateStructuredOutput<T>(options: GenerateStructuredOutputOptions): Promise<T> {
    this.ensureApiKey();
    const model = options.model || process.env.AI_MODEL || this.defaultModel;

    const systemPrompt = [
      options.systemInstruction || "You are an expert engineering architect.",
      "CRITICAL: You MUST respond ONLY with a raw JSON object or JSON array.",
      "Do NOT include conversational preamble, explanations, markdown fences, or text outside the valid JSON."
    ].join("\n");

    const userPrompt = options.schemaDescription
      ? `${options.prompt}\n\nREQUIRED OUTPUT SCHEMA:\n${options.schemaDescription}\n\nRespond with valid JSON only:`
      : `${options.prompt}\n\nRespond with valid JSON only:`;

    return withExponentialBackoff(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            temperature: options.temperature ?? 0.7,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || response.statusText;
          throw this.translateHttpError(response.status, errMsg);
        }

        const data: any = await response.json();
        const text = data?.content?.[0]?.text || "";
        return extractJsonFromText(text) as T;
      } catch (err: any) {
        if (err instanceof AIProviderError) throw err;
        throw new AIProviderError(`Anthropic network/fetch error: ${err.message}`, this.name, 500, true);
      }
    });
  }

  private translateHttpError(status: number, message: string): AIProviderError {
    const isAuth = status === 401 || status === 403;
    const isRateLimit = status === 429;
    const isTransient = isRateLimit || status === 529 || status === 500 || status === 503;

    return new AIProviderError(
      `Anthropic error (${status}): ${message}`,
      this.name,
      status,
      isTransient,
      isAuth
    );
  }
}
