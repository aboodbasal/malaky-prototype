import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { conversations, messages } from "./schema";

export async function listConversations(businessId: string, userId: string) {
  return db
    .select({
      id: conversations.id,
      title: conversations.title,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.businessId, businessId),
        eq(conversations.userId, userId),
      ),
    )
    .orderBy(desc(conversations.updatedAt))
    .limit(50);
}

export async function getConversationWithMessages(
  conversationId: string,
  businessId: string,
) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.businessId, businessId),
      ),
    )
    .limit(1);
  if (!conversation) return null;

  const rows = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.businessId, businessId),
      ),
    )
    .orderBy(asc(messages.createdAt));

  return { conversation, messages: rows };
}
