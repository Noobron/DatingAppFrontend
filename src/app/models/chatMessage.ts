// Interface for a ChatMessage object
export interface ChatMessage {
  messageType: string;
  sender: string;
  recipient: string;
  createdAt: string | Date;
  seen: boolean;
  content: string;
}
