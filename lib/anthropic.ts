import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-opus-4-7";

export const SYSTEM_PROMPT = `أنت ملاكي، مساعد ذكي للأعمال العربية. تحدث بالعربية الفصحى أو لهجة المستخدم. كن مفيداً ومباشراً وموجزاً. إذا تواصل المستخدم بالإنجليزية، يمكنك الرد بالإنجليزية.`;
