// Import Angular packages
import { Component, OnDestroy, OnInit } from '@angular/core';

// Import Models
import { ChatRoom } from '../models/chatRoom';
import { AccountManagerService } from '../services/account/account-manager.service';
import { User } from '../models/user';
import { Account } from '../models/account';
import { ChatMessage } from '../models/chatMessage';

// Import Services
import { UserChatService } from '../services/user/user-chat.service';

// Import other dependencies
import { WebSocketSubject } from 'rxjs/webSocket';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  // list of chat rooms of the user
  chatFeed: ChatRoom[] = [];

  // current account
  currentAccount: Account | null = null;

  webSocket$: WebSocketSubject<any> | null = null;

  selectedChatIndex: number | null = null;

  specificUser: User | null = null;

  currentUser: User | null = null;

  feedSocketSubscription: Subscription | null = null;

  lastChatFeedNonCallMessageType: Map<string, ChatMessage['messageType']> =
    new Map();

  preprocessChatFeedMessage(type: string, content: string) {
    let maxLen = 30;

    if (type === 'text' || type === 'call')
      return (
        content.substring(0, maxLen) + (content.length > maxLen ? '...' : '')
      );

    return content;
  }

  constructor(
    private userChatService: UserChatService,
    private userService: UserService,
    private accountManagerService: AccountManagerService,
    private router: Router
  ) {
    this.accountManagerService.currentAccount$.subscribe((account) => {
      this.currentAccount = account;

      const specificUserState =
        this.router.getCurrentNavigation()?.extras.state;
      let specificUser =
        specificUserState !== undefined
          ? specificUserState!.userToChat.queryParams.user
          : undefined;

      this.userChatService.getChatFeed().subscribe((result) => {
        if (this.chatFeed.length === 0) {
          result.sort((a: ChatRoom, b: ChatRoom) => {
            return a.lastChatMessage!.createdAt > b.lastChatMessage!.createdAt
              ? -1
              : 1;
          });

          result.forEach((chatRoom) => {
            if (chatRoom.lastChatMessage) {
              chatRoom.lastChatMessage.createdAt = new Date(
                chatRoom.lastChatMessage.createdAt
              );

              let otherUser: string =
                chatRoom.lastChatMessage.sender ===
                this.currentAccount?.username
                  ? chatRoom.lastChatMessage.recipient
                  : chatRoom.lastChatMessage.sender;

              if (chatRoom.lastChatMessage.messageType !== 'call')
                this.lastChatFeedNonCallMessageType.set(
                  otherUser,
                  chatRoom.lastChatMessage.messageType
                );

              chatRoom.lastChatMessage.content = this.preprocessChatFeedMessage(
                chatRoom.lastChatMessage.messageType,
                chatRoom.lastChatMessage.content
              );

              this.chatFeed.push(chatRoom);
            }
          });

          let index = this.chatFeed.findIndex((chatRoom) => {
            return (
              specificUser !== undefined &&
              (specificUser.username == chatRoom.firstUser.username ||
                specificUser.username == chatRoom.secondUser.username)
            );
          });

          if (specificUser !== undefined) {
            if (index === -1) {
              this.userService
                .getUser(account.username)
                .subscribe((currentUser) => {
                  this.currentUser = currentUser;
                  this.specificUser = specificUser;
                });
            } else this.selectedChatIndex = index;
          }

          this.webSocket$ = this.userChatService.getChatFeedSocket();

          if (this.webSocket$ !== null) {
            this.feedSocketSubscription = this.webSocket$?.subscribe((msg) => {
              if (
                msg.type === 'feed' &&
                msg.chat_room !== undefined &&
                msg.other_user !== undefined
              ) {
                let chatRoom: ChatRoom = msg.chat_room;
                let otherUser: string = msg.other_user;

                let index = this.chatFeed.findIndex((item) => {
                  return (
                    item.firstUser.username === otherUser ||
                    item.secondUser.username === otherUser
                  );
                });

                let selectedChatRoom =
                  this.selectedChatIndex === null
                    ? null
                    : this.chatFeed[this.selectedChatIndex];

                let previousChatRoomLastChatMessage: ChatMessage | null = null;
                if (index !== -1) {
                  previousChatRoomLastChatMessage = this.chatFeed.splice(
                    index,
                    1
                  )[0].lastChatMessage;
                }

                if (otherUser !== this.currentAccount?.username) {
                  chatRoom.lastChatMessage!.createdAt = new Date(
                    chatRoom.lastChatMessage!.createdAt
                  );

                  if (
                    previousChatRoomLastChatMessage !== null &&
                    chatRoom.lastChatMessage?.messageType === 'call'
                  ) {
                    let content = chatRoom.lastChatMessage.content;
                    chatRoom.lastChatMessage = previousChatRoomLastChatMessage;

                    if (content !== 'call-arbitrate')
                      chatRoom.lastChatMessage.messageType = 'call';
                    else if (this.lastChatFeedNonCallMessageType.get(otherUser))
                      chatRoom.lastChatMessage.messageType =
                        this.lastChatFeedNonCallMessageType.get(otherUser)!;
                  }

                  if (chatRoom.lastChatMessage?.messageType !== 'call')
                    this.lastChatFeedNonCallMessageType.set(
                      otherUser,
                      chatRoom.lastChatMessage!.messageType
                    );

                  chatRoom.lastChatMessage!.content =
                    this.preprocessChatFeedMessage(
                      chatRoom.lastChatMessage!.messageType,
                      chatRoom.lastChatMessage!.content
                    );

                  this.chatFeed.unshift(chatRoom);

                  if (selectedChatRoom !== null) {
                    if (selectedChatRoom.chatRoomName === chatRoom.chatRoomName)
                      this.selectedChatIndex = 0;
                    else if (this.selectedChatIndex !== null)
                      this.selectedChatIndex++;
                  } else if (
                    chatRoom.firstUser.username ===
                      this.specificUser?.username ||
                    chatRoom.secondUser.username === this.specificUser?.username
                  ) {
                    this.selectedChatIndex = 0;
                    this.specificUser = null;
                  }
                }
              } else if (msg.type === 'update' && msg.seen !== undefined) {
                let otherUser = msg.seen;

                let index = this.chatFeed.findIndex((item) => {
                  return (
                    item.firstUser.username === otherUser ||
                    item.secondUser.username === otherUser
                  );
                });

                if (
                  index !== -1 &&
                  this.chatFeed[index].lastChatMessage !== null
                ) {
                  this.chatFeed[index].lastChatMessage!.seen = true;
                }
              }
            });
          }
        }
      });
    });
  }

  selectChat(index: number) {
    this.selectedChatIndex = index;

    let message: ChatMessage =
      this.chatFeed[this.selectedChatIndex].lastChatMessage!;
    if (
      message.seen == false &&
      message.sender !== this.currentAccount?.username
    )
      this.chatFeed[this.selectedChatIndex].lastChatMessage!.seen = true;

    this.specificUser = null;
  }

  closeConnection() {
    this.webSocket$?.complete();
    this.feedSocketSubscription?.unsubscribe();
    this.webSocket$ = null;
  }

  ngOnDestroy(): void {
    this.closeConnection();
  }

  ngOnInit(): void {}
}
