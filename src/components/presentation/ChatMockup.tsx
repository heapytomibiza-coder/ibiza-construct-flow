import { cn } from "@/lib/utils";

interface Message {
  id: number;
  sender: "client" | "professional";
  content: string;
  time: string;
}

interface ChatMockupProps {
  messages: Message[];
  className?: string;
}

export const ChatMockup = ({ messages, className }: ChatMockupProps) => {
  return (
    <div className={cn("space-y-3 p-4 rounded-xl bg-muted/30 border border-sage-muted/30", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 items-start",
            message.sender === "client" && "flex-row-reverse"
          )}
        >
          <div className={cn(
            "h-8 w-8 rounded-full flex-shrink-0",
            message.sender === "professional" ? "bg-sage/30" : "bg-copper/30"
          )} />
          <div className={cn(
            "flex-1 max-w-[70%]",
            message.sender === "client" && "text-right"
          )}>
            <div className={cn(
              "inline-block p-3 rounded-lg text-sm",
              message.sender === "professional" 
                ? "bg-background border border-sage-muted/30" 
                : "bg-copper/10 border border-copper/20"
            )}>
              {message.content}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{message.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
