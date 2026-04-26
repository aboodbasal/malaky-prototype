import { signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;
    await signIn("resend", { email, redirectTo: "/app" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold">تسجيل الدخول</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          سنرسل لك رابط دخول إلى بريدك الإلكتروني
        </p>

        <form action={loginAction} className="mt-8 space-y-4">
          <input
            type="email"
            name="email"
            required
            placeholder="البريد الإلكتروني"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-gray-500"
            dir="ltr"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:bg-gray-800"
          >
            إرسال رابط الدخول
          </button>
        </form>
      </div>
    </main>
  );
}
