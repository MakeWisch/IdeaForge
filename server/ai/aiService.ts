import { NormalizedAIRequest, NormalizedAIResponse, AIProviderError } from "./types";
import { registry } from "./providerRegistry";
import { TASKS } from "./tasks";

export async function executeAITask<T = any>(
  request: NormalizedAIRequest
): Promise<NormalizedAIResponse<T>> {
  const { task, input, context, preferredProvider } = request;

  if (!task || !TASKS[task]) {
    return {
      success: false,
      task: task || 'analyze_idea',
      provider: 'unknown',
      model: 'unknown',
      fallbackUsed: false,
      error: `Invalid or unsupported task: '${task}'. Available tasks: ${Object.keys(TASKS).join(', ')}`,
      errorCode: 'INVALID_TASK',
    };
  }

  if (!input || typeof input !== 'string' || !input.trim()) {
    return {
      success: false,
      task,
      provider: 'unknown',
      model: 'unknown',
      fallbackUsed: false,
      error: 'Input string is required for AI task execution.',
      errorCode: 'MISSING_INPUT',
    };
  }

  const taskDef = TASKS[task];
  const primaryProviderName = preferredProvider || registry.getPrimaryProviderName();
  const fallbackProviderName = registry.getFallbackProviderName();

  let primaryProvider;
  try {
    primaryProvider = registry.getProvider(primaryProviderName);
  } catch (err: any) {
    return {
      success: false,
      task,
      provider: primaryProviderName,
      model: 'unknown',
      fallbackUsed: false,
      error: err.message,
      errorCode: 'PROVIDER_NOT_FOUND',
    };
  }

  const prompt = taskDef.buildPrompt(input, context);

  // Attempt Primary Provider
  try {
    const data = await primaryProvider.generateStructuredOutput<T>({
      prompt,
      systemInstruction: taskDef.systemInstruction,
      schemaDescription: taskDef.schemaDescription,
      temperature: 0.7,
    });

    return {
      success: true,
      task,
      provider: primaryProvider.name,
      model: process.env.AI_MODEL || primaryProvider.defaultModel,
      fallbackUsed: false,
      data,
    };
  } catch (primaryErr: any) {
    console.error(`[AI Provider: ${primaryProvider.name}] Task execution failed:`, primaryErr.message);

    // Rule: Do NOT silently switch providers for authentication/configuration errors.
    const isAuthError = primaryErr?.isAuthError || primaryErr?.statusCode === 401 || primaryErr?.statusCode === 403;
    if (isAuthError) {
      return {
        success: false,
        task,
        provider: primaryProvider.name,
        model: process.env.AI_MODEL || primaryProvider.defaultModel,
        fallbackUsed: false,
        error: primaryErr.message,
        errorCode: 'AUTH_ERROR',
      };
    }

    // Check if fallback provider is configured and this was a transient failure (e.g. 429 rate limit, 503, timeout)
    const canAttemptFallback = 
      fallbackProviderName && 
      fallbackProviderName !== primaryProvider.name && 
      (primaryErr?.isTransient || primaryErr?.statusCode === 429 || primaryErr?.statusCode >= 500);

    if (canAttemptFallback) {
      console.warn(`[AI Fallback] Attempting fallback provider '${fallbackProviderName}' due to transient error on '${primaryProvider.name}'...`);
      try {
        const fallbackProvider = registry.getProvider(fallbackProviderName);
        const data = await fallbackProvider.generateStructuredOutput<T>({
          prompt,
          systemInstruction: taskDef.systemInstruction,
          schemaDescription: taskDef.schemaDescription,
          temperature: 0.7,
        });

        return {
          success: true,
          task,
          provider: fallbackProvider.name,
          model: process.env.AI_MODEL || fallbackProvider.defaultModel,
          fallbackUsed: true,
          data,
        };
      } catch (fallbackErr: any) {
        console.error(`[AI Fallback: ${fallbackProviderName}] Fallback execution also failed:`, fallbackErr.message);
        return {
          success: false,
          task,
          provider: primaryProvider.name,
          model: process.env.AI_MODEL || primaryProvider.defaultModel,
          fallbackUsed: false,
          error: `Primary (${primaryProvider.name}: ${primaryErr.message}) and Fallback (${fallbackProviderName}: ${fallbackErr.message}) both failed.`,
          errorCode: 'FALLBACK_FAILED',
        };
      }
    }

    return {
      success: false,
      task,
      provider: primaryProvider.name,
      model: process.env.AI_MODEL || primaryProvider.defaultModel,
      fallbackUsed: false,
      error: primaryErr.message || 'Unknown provider error occurred.',
      errorCode: primaryErr?.statusCode === 429 ? 'RATE_LIMIT' : 'PROVIDER_ERROR',
    };
  }
}
