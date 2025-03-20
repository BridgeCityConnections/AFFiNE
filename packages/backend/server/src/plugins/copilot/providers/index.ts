import { FalProvider } from './fal';
import { GoogleProvider } from './google';
import { OpenAIProvider } from './openai';
import { PerplexityProvider } from './perplexity';

export const CopilotProviders = [
  FalProvider,
  GoogleProvider,
  OpenAIProvider,
  PerplexityProvider,
];

export { CopilotProviderFactory } from './factory';
export { FalProvider } from './fal';
export { GoogleProvider } from './google';
export { OpenAIProvider } from './openai';
export { PerplexityProvider } from './perplexity';
export * from './types';
