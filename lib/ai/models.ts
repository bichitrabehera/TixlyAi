import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogle } from "@langchain/google";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AiProvider } from "@/lib/constants";
import { AI_MODEL_CONFIG } from "./config";

export type ChatModelInstance = BaseChatModel;

/**
 * OpenAI reasoning models (o-series and the gpt-5 family) reject any
 * `temperature` other than the default (1) with a 400. Sending ours makes
 * every call fail, which the agent then reports as "no structured output".
 * For these we simply omit the parameter and let the provider default stand.
 */
export function modelSupportsTemperature(
  provider: AiProvider,
  model: string,
): boolean {
  if (provider !== "openai") return true;
  return !/^(o\d|gpt-5)/i.test(model.trim());
}

/**
 * Builds a LangChain chat model for the user's BYOK key.
 * The key is passed per-request — it never reaches a server env var.
 * `model` optionally overrides the provider default (user's model pick).
 */
export function createChatModel(
  provider: AiProvider,
  apiKey: string,
  temperature: number,
  model?: string,
): ChatModelInstance {
  const config = AI_MODEL_CONFIG[provider];
  const modelName = model?.trim() || config.model;

  if (provider === "anthropic") {
    return new ChatAnthropic({
      apiKey,
      model: modelName,
      temperature,
      maxTokens: 4096,
      maxRetries: 0,
    });
  }

  if (provider === "google") {
    return new ChatGoogle({
      apiKey,
      model: modelName,
      temperature,
      maxOutputTokens: 4096,
      maxRetries: 0,
    });
  }

  const supportsTemperature = modelSupportsTemperature(provider, modelName);

  return new ChatOpenAI({
    apiKey,
    model: modelName,
    maxRetries: 0,
    ...(supportsTemperature ? { temperature } : {}),
    ...(config.baseURL ? { configuration: { baseURL: config.baseURL } } : {}),
  });
}
