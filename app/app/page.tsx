import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AppHome() {
  const session = await auth();

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold">ملاكي</h1>
        <p className="mt-2 text-gray-600">
          مرحباً {session?.user?.email ?? ""}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          المنشأة: {session?.user?.businessId ?? "—"}
        </p>

        <p className="mt-10 text-sm text-gray-500">
          واجهة المحادثة قادمة بعد قليل...
        </p>

        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
    </main>
  );
}
