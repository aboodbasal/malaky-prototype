import Link from "next/link";
import { signOut } from "@/auth";

type Conversation = {
  id: string;
  title: string;
  updatedAt: Date;
};

type Props = {
  conversations: Conversation[];
  activeId?: string;
  userEmail?: string | null;
};

export function Sidebar({ conversations, activeId, userEmail }: Props) {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-s border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 p-4">
        <Link href="/app" className="block">
          <h2 className="text-xl font-bold">ملاكي</h2>
        </Link>
        <Link
          href="/app"
          className="mt-3 inline-block rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100"
        >
          + محادثة جديدة
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="p-2 text-sm text-gray-500">لا توجد محادثات بعد</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/app/${c.id}`}
                  className={`block truncate rounded-lg px-3 py-2 text-sm ${
                    c.id === activeId
                      ? "bg-gray-200 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="border-t border-gray-200 p-4">
        {userEmail ? (
          <p className="mb-2 truncate text-xs text-gray-500" dir="ltr">
            {userEmail}
          </p>
        ) : null}
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
