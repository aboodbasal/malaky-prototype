import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getConversationWithMessages,
  listConversations,
} from "@/lib/db/queries";
import { Sidebar } from "@/components/sidebar";
import { ChatInput } from "@/components/chat-input";
import { MessageList } from "@/components/message-list";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;

  if (!userId || !businessId) notFound();

  const data = await getConversationWithMessages(
    params.conversationId,
    businessId,
  );
  if (!data) notFound();

  const conversations = await listConversations(businessId, userId);

  return (
    <div className="flex min-h-screen">
      <main className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 px-6 py-4">
          <h1 className="truncate text-lg font-semibold">
            {data.conversation.title}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl">
            <MessageList messages={data.messages} />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput conversationId={params.conversationId} autoFocus />
          </div>
        </div>
      </main>
      <Sidebar
        conversations={conversations}
        activeId={params.conversationId}
        userEmail={session?.user?.email}
      />
    </div>
  );
}
