import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
        </div>
      )}
      
      <div className={cn("max-w-[80%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-5 py-3",
              isUser
                ? "bg-amber-500 text-black"
                : "bg-zinc-900 border border-zinc-800 text-zinc-100"
            )}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-invert prose-sm max-w-none 
                  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                  prose-p:leading-relaxed prose-p:my-2
                  prose-ul:my-2 prose-ol:my-2
                  prose-li:my-0.5
                  prose-headings:text-amber-100
                  prose-strong:text-amber-200
                  prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline"
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}