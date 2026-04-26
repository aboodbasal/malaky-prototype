import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">ملاكي</h1>
        <p className="mt-4 text-lg text-gray-600">
          مساعدك الذكي للأعمال — تحدث بأي لهجة عربية
        </p>

        <form className="mt-10">
          <input
            type="text"
            placeholder="اسأل ملاكي أي شيء..."
            className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base shadow-sm outline-none focus:border-gray-500"
            disabled
          />
          <p className="mt-3 text-sm text-gray-500">
            سجّل الدخول للبدء
          </p>
        </form>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </main>
  );
}
