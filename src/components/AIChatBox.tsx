import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, BotIcon, Trash } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, KeyboardEvent } from "react";
import "./AIChatBox.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

export default function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 right-0 z-10 max-w-2xl p-4 lg:w-3/5"
        >
          <motion.div
            className="flex flex-col overflow-hidden rounded-lg bg-background shadow-2xl"
            initial={{ height: 0 }}
            animate={{ height: "540px" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-4" ref={scrollRef}>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
                {isLoading && lastMessageIsUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ChatMessage
                      message={{
                        role: "assistant",
                        content: "Thinking...",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {error && (
                <ChatMessage
                  message={{
                    role: "assistant",
                    content: "Something went wrong. Please try again later.",
                  }}
                />
              )}
              {!error && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Bot className="h-12 w-12 text-gray-400" />
                  <span className="max-w-xs text-sm text-gray-500">
                    Hi, I&apos;m your personal assistant. Ask me anything about your
                    notes.
                  </span>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button
                  title="clear-chat"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  type="button"
                  onClick={() => setMessages([])}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your notes"
                  ref={inputRef}
                  className="flex-grow"
                />
                <Button type="submit" className="shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content"> & { id?: string | undefined };
}) {
  const { user } = useUser();
  const isAIMessage = role === "assistant";

  return (
    <div
      className={cn(
        "mb-4 flex items-start",
        isAIMessage ? "justify-start" : "justify-end",
      )}
    >
      {isAIMessage && (
        <div className="mr-2 flex-shrink-0">
          <BotIcon className="h-8 w-8 text-blue-500" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isAIMessage ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white",
        )}
      >
        <ReactMarkdown
          className="react-markdown text-sm"
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>
      {!isAIMessage && user?.imageUrl && (
        <div className="ml-2 flex-shrink-0">
          <Image
            src={user.imageUrl}
            alt="user image"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
