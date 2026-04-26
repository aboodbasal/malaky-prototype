"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  conversationId?: string;
  autoFocus?: boolean;
};

export function ChatInput({ conversationId, autoFocus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [, startTransition] = useTransition();

  async function send() {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    setError(null);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "حدث خطأ. حاول مرة أخرى.");
        return;
      }

      const data: { conversationId: string } = await res.json();
      setValue("");

      if (data.conversationId !== conversationId) {
        router.push(`/app/${data.conversationId}`);
      } else {
        startTransition(() => router.refresh());
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="relative"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="اسأل ملاكي أي شيء..."
          rows={2}
          autoFocus={autoFocus}
          disabled={isSending}
          className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-5 py-4 pe-24 text-base shadow-sm outline-none focus:border-gray-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending || !value.trim()}
          className="absolute bottom-3 start-3 rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isSending ? "جارٍ الإرسال..." : "إرسال"}
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
