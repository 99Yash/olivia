import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Cloudflare AI Gateway — mirrors alfred/packages/ai/src/gateway.ts
 * When CLOUDFLARE_AI_GATEWAY_TOKEN (or AI_GATEWAY_API_KEY=cfut_...) +
 * CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_GATEWAY_ID are all set, every LLM call
 * routes via https://gateway.ai.cloudflare.com/v1/{account}/{gateway}/{provider}
 * with Unified Billing (single cfut_ token for all models). Otherwise falls
 * back to direct provider keys (OPENAI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY).
 * See ../alfred/docs/research/cloudflare-ai-gateway-provider-wiring.md
 */

function gatewayConfig():
  | { token: string; accountId: string; gatewayId: string }
  | undefined {
  const rawToken =
    process.env.CLOUDFLARE_AI_GATEWAY_TOKEN?.trim() ||
    (process.env.AI_GATEWAY_API_KEY?.startsWith('cfut_')
      ? process.env.AI_GATEWAY_API_KEY.trim()
      : undefined);
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const gatewayId = process.env.CLOUDFLARE_GATEWAY_ID?.trim();
  if (rawToken && accountId && gatewayId) return { token: rawToken, accountId, gatewayId };
  return undefined;
}

function gatewayBaseUrl(cfg: { accountId: string; gatewayId: string }, provider: string): string {
  return `https://gateway.ai.cloudflare.com/v1/${cfg.accountId}/${cfg.gatewayId}/${provider}`;
}

function gatewayHeaders(token: string): Record<string, string> {
  return { 'cf-aig-authorization': `Bearer ${token}` };
}

const cfg = gatewayConfig();

export const openai = cfg
  ? createOpenAI({
      apiKey: cfg.token,
      baseURL: gatewayBaseUrl(cfg, 'openai'),
      headers: gatewayHeaders(cfg.token),
    })
  : createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

export const google = cfg
  ? createGoogleGenerativeAI({
      apiKey: cfg.token,
      baseURL: gatewayBaseUrl(cfg, 'google-ai-studio/v1beta'),
      headers: gatewayHeaders(cfg.token),
    })
  : createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
