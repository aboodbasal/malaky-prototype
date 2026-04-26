import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { anthropic, CLAUDE_MODEL, SYSTEM_PROMPT } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(8000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.businessId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const userId = session.user.id;
  const businessId = session.user.businessId;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const { message } = parsed.data;
  let { conversationId } = parsed.data;

  if (conversationId) {
    const [existing] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.businessId, businessId),
        ),
      )
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 });
    }
  } else {
    const [created] = await db
      .insert(conversations)
      .values({
        businessId,
        userId,
        title: message.slice(0, 60),
      })
      .returning({ id: conversations.id });
    conversationId = created.id;
  }

  await db.insert(messages).values({
    conversationId,
    businessId,
    role: "user",
    content: message,
  });

  const history = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.businessId, businessId),
      ),
    )
    .orderBy(asc(messages.createdAt));

  const claudeMessages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: claudeMessages,
  });

  const assistantText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  await db.insert(messages).values({
    conversationId,
    businessId,
    role: "assistant",
    content: assistantText,
  });

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return NextResponse.json({
    conversationId,
    reply: assistantText,
  });
}
