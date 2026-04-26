import { auth } from "@/auth";
import { listConversations } from "@/lib/db/queries";
import { Sidebar } from "@/components/sidebar";
import { ChatInput } from "@/components/chat-input";

export const dynamic = "force-dynamic";

export default async function AppHome() {
  const session = await auth();
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;

  const conversations =
    userId && businessId ? await listConversations(businessId, userId) : [];

  return (
    <div className="flex min-h-screen">
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">ملاكي</h1>
          <p className="mt-4 text-lg text-gray-600">
            مساعدك الذكي — اسأل أي شيء للبدء
          </p>
          <div className="mt-10">
            <ChatInput autoFocus />
          </div>
        </div>
      </main>
      <Sidebar conversations={conversations} userEmail={session?.user?.email} />
    </div>
  );
}
