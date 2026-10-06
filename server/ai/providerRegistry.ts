import { AIProvider } from "./types";
import { GeminiProvider } from "./providers/GeminiProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { AnthropicProvider } from "./providers/AnthropicProvider";

type ProviderFactory = () => AIProvider;

class ProviderRegistry {
  private factories = new Map<string, ProviderFactory>();
  private instances = new Map<string, AIProvider>();

  constructor() {
    this.register("gemini", () => new GeminiProvider());
    this.register("openai", () => new OpenAIProvider());
    this.register("anthropic", () => new AnthropicProvider());
  }

  public register(name: string, factory: ProviderFactory): void {
    const key = name.toLowerCase().trim();
    this.factories.set(key, factory);
    this.instances.delete(key); // invalidate cached instance if re-registered
  }

  public getProvider(name?: string): AIProvider {
    const targetName = (name || this.getPrimaryProviderName()).toLowerCase().trim();
    
    if (this.instances.has(targetName)) {
      return this.instances.get(targetName)!;
    }

    const factory = this.factories.get(targetName);
    if (!factory) {
      const available = Array.from(this.factories.keys()).join(", ");
      throw new Error(`Unknown AI provider '${targetName}'. Available providers are: ${available}`);
    }

    const instance = factory();
    this.instances.set(targetName, instance);
    return instance;
  }

  public getPrimaryProviderName(): string {
    return (process.env.AI_PRIMARY_PROVIDER || process.env.AI_PROVIDER || "gemini").toLowerCase().trim();
  }

  public getFallbackProviderName(): string | undefined {
    const fallback = process.env.AI_FALLBACK_PROVIDER?.toLowerCase().trim();
    if (fallback && this.factories.has(fallback)) {
      return fallback;
    }
    return undefined;
  }

  public getStatus() {
    const primary = this.getPrimaryProviderName();
    const fallback = this.getFallbackProviderName();
    const model = process.env.AI_MODEL || "default-for-provider";
    const available = Array.from(this.factories.keys());

    return {
      primaryProvider: primary,
      fallbackProvider: fallback || null,
      configuredModel: model,
      availableProviders: available,
    };
  }
}

export const registry = new ProviderRegistry();

export function getAIProvider(name?: string): AIProvider {
  return registry.getProvider(name);
}

export function registerAIProvider(name: string, factory: ProviderFactory): void {
  registry.register(name, factory);
}
