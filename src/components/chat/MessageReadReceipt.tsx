import { Check, CheckCheck } from "lucide-react";

interface MessageReadReceiptProps {
  isOwn: boolean;
  isRead: boolean;
}

const MessageReadReceipt = ({ isOwn, isRead }: MessageReadReceiptProps) => {
  if (!isOwn) return null;

  return (
    <span className="inline-flex ml-1">
      {isRead ? (
        <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
      ) : (
        <Check className="h-3 w-3 text-primary-foreground/70" />
      )}
    </span>
  );
};

export default MessageReadReceipt;
