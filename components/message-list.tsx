type Message = {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
};

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${
            m.role === "user" ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-base leading-relaxed ${
              m.role === "user"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}
