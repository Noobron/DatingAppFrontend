// Interface for a ChatMessage object
export interface ChatMessage {
  messageType: 'text' | 'call';
  sender: string;
  recipient: string;
  createdAt: string | Date;
  seen: boolean;
  content: string;
}
