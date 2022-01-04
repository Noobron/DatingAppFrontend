import { ChatMessage } from './chatMessage';
import { User } from './user';

// Interface for a ChatRoom object
export interface ChatRoom {
  chatRoomName: string;
  lastChatMessage: ChatMessage | null;
  firstUser: User;
  secondUser: User;
}
