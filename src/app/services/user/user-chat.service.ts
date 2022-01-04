// Import Angular packages
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Import Models
import { ChatRoom } from 'src/app/models/chatRoom';

// Import other dependencies
import { environment } from '../../../environments/environment';
import { webSocket } from 'rxjs/webSocket';
import { API_Paths } from '../../api/paths';
import { WEBSOCKET_Paths } from 'src/app/websocket/websocket_paths';

// Import Services
import { TokenService } from '../token.service';
import { ChatMessage } from 'src/app/models/chatMessage';

@Injectable({
  providedIn: 'root',
})
export class UserChatService {
  private baseApiUrl: string = environment.API_URL;
  private baseWebSocketUrl: string = environment.WEBSOCKET_URL;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Get chat feed of the current logged in user from database (Token needs to applied explicitly if not done by interceptor)
  // The order of the chat rooms may not be ordered. Explicit sorting might be required
  getChatFeed() {
    return this.http.get<ChatRoom[]>(this.baseApiUrl + API_Paths.chatFeed);
  }

  // Get chat feed of the current logged in user in realtime
  getChatFeedSocket() {
    if (!this.tokenService.isAccessTokenExpired())
      return webSocket<{ chat_room: ChatRoom; other_user: string }>(
        this.baseWebSocketUrl +
          WEBSOCKET_Paths.chatFeed +
          '?access_token=' +
          this.tokenService.getAccessToken()!
      );

    return null;
  }

  // Get chat messages in a (default) batch of 20
  getChatMessages(otherUser: string, offset = 0, limit = 20) {
    let params: any = {
      limit: limit,
      offset: offset,
      other_user: otherUser,
    };

    return this.http.get<ChatMessage[]>(
      this.baseApiUrl + API_Paths.chatMessages,
      {
        params: params,
      }
    );
  }

  // Get chat messages of a chat room for the current logged in user in realtime
  getChatMessageSocket(currentUser: string, otherUser: string) {
    if (!this.tokenService.isAccessTokenExpired())
      return webSocket<any>(
        this.baseWebSocketUrl +
          WEBSOCKET_Paths.chatRoom +
          currentUser +
          '_' +
          otherUser +
          '_chat/?access_token=' +
          this.tokenService.getAccessToken()!
      );

    return null;
  }

  // Mark all unread chat messages stored in database of a chat room as seen
  markUnreadMessagesAsSeen(otherUser: string) {
    return this.http.put(this.baseApiUrl + API_Paths.markChatMessagesAsSeen, {
      other_user: otherUser,
    });
  }
}
