// Import Angular packages
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

// Import Models
import { User } from 'src/app/models/user';
import { ChatMessage } from 'src/app/models/chatMessage';

// Import Services
import { UserChatService } from 'src/app/services/user/user-chat.service';
import { AccountStatusService } from 'src/app/services/account/account-status.service';

// Import other dependencies
import { WebSocketSubject } from 'rxjs/webSocket';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CallComponent } from './call/call.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  @ViewChild('ChatBox') private scrollContainer!: ElementRef;
  @ViewChildren('ChatMessage', { read: ElementRef })
  chatMessageContainer!: QueryList<ElementRef>;

  private hasUnreadMessages = false;

  @Input()
  currentUserInput!: User;

  @Input()
  otherUserInput!: User;

  currentUser: User | null = null;

  otherUser: User | null = null;

  statusWebSocket$: WebSocketSubject<any> | null = null;

  chatWebSocket$: WebSocketSubject<any> | null = null;

  statusSubscription: Subscription | null = null;

  chatSubscription: Subscription | null = null;

  chatMessages: ChatMessage[] = [];

  otherUserStatus: string | null = null;

  lastSeenMessageRelativeIndex = -1;

  offset = 0;

  model: FormGroup;

  constructor(
    private userChatService: UserChatService,
    private accountStatusService: AccountStatusService,
    private _modalService: NgbModal
  ) {
    this.model = new FormGroup({
      text: new FormControl('', [Validators.required, Validators.minLength(1)]),
    });
  }

  ngAfterViewInit() {
    this.chatMessageContainer.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }

  sendTextMessage() {
    if (!this.model.invalid) {
      let chatMessage: ChatMessage = {
        sender: this.currentUser!.username,
        recipient: this.otherUser!.username,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        content: this.model.controls['text'].value.trim(),

        // seen will be updated by chat server
        seen: false,
      };

      this.chatWebSocket$?.next({
        data: chatMessage,
      });

      this.model.reset();
    }
  }

  loadPreviousMessagesFromDatabase() {
    this.userChatService
      .getChatMessages(this.otherUser!.username, this.offset)
      .subscribe((result) => {
        result.forEach((chatMessage) => {
          this.chatMessages.unshift(chatMessage);
        });

        this.offset += result.length;
      });
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  setupChat() {
    this.resetData();

    this.statusWebSocket$ = this.accountStatusService.getAccountStatusSocket(
      this.otherUser!.username
    );

    this.statusSubscription = this.statusWebSocket$.subscribe((msg) => {
      if ((msg.type = 'status' && msg.status != undefined))
        this.otherUserStatus = msg.status;
      else this.otherUserStatus = null;
    });

    this.userChatService
      .getChatMessages(this.otherUser!.username, this.offset)
      .pipe(take(1))
      .subscribe((result) => {
        let index = 0;
        result.forEach((chatMessage) => {
          if (
            chatMessage.recipient === this.otherUser!.username &&
            chatMessage.seen === true &&
            this.lastSeenMessageRelativeIndex === -1
          )
            this.lastSeenMessageRelativeIndex = index;

          if (
            chatMessage.seen == false &&
            chatMessage.recipient === this.currentUser!.username
          )
            this.hasUnreadMessages = true;

          this.chatMessages.unshift(chatMessage);
          index++;
        });

        this.offset += result.length;

        if (this.hasUnreadMessages === true)
          this.userChatService
            .markUnreadMessagesAsSeen(this.otherUser!.username)
            .subscribe();

        this.chatWebSocket$ = this.userChatService.getChatMessageSocket(
          this.currentUser!.username,
          this.otherUser!.username
        );

        if (this.chatWebSocket$ !== null) {
          this.chatSubscription = this.chatWebSocket$?.subscribe((msg) => {
            if (msg.type === 'availability') {
              if (msg.user_available === this.otherUser!.username) {
                for (
                  let index =
                    this.lastSeenMessageRelativeIndex === -1
                      ? 0
                      : this.chatMessages.length -
                        this.lastSeenMessageRelativeIndex -
                        1;
                  index < this.chatMessages.length;
                  index++
                ) {
                  let chatMessage = this.chatMessages[index];
                  if (
                    chatMessage.recipient === this.otherUser!.username &&
                    chatMessage.seen === false
                  ) {
                    this.chatMessages[index].seen = true;
                    this.lastSeenMessageRelativeIndex =
                      this.chatMessages.length - index - 1;
                  }
                }
              }
            } else if (
              msg.type === 'message' &&
              msg.chat_message !== undefined
            ) {
              let chatMessage: ChatMessage = msg.chat_message;

              if (chatMessage.messageType === 'text') {
                this.chatMessages.push(chatMessage);

                if (
                  chatMessage.recipient === this.otherUser!.username &&
                  chatMessage.seen === true
                )
                  this.lastSeenMessageRelativeIndex = 0;
                else if (this.lastSeenMessageRelativeIndex !== -1)
                  this.lastSeenMessageRelativeIndex++;
              } else if (
                chatMessage.messageType === 'call' &&
                chatMessage.recipient == this.currentUser?.username &&
                chatMessage.content !== 'call-arbitrate'
              ) {
                let d1 = new Date();
                let d2 = new Date(chatMessage.createdAt);

                if ((d1.getTime() - d2.getTime()) / 1000 <= 35)
                  this.open(chatMessage.content);
              }
            }
          });
        }
      });
  }

  makeCall() {
    this.open();
  }

  open(remotePeerId: string | null = null) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
    };

    const modalRef = this._modalService.open(CallComponent, ngbModalOptions);

    if (remotePeerId) modalRef.componentInstance.remotePeerId = remotePeerId;

    if (this.chatWebSocket$)
      modalRef.componentInstance.chatWebSocket$ = this.chatWebSocket$;

    modalRef.componentInstance.sender = this.currentUser;

    modalRef.componentInstance.recipient = this.otherUser;

    modalRef.result.then();
  }

  ngOnChanges() {
    if (
      this.currentUserInput.username !== this.currentUser?.username ||
      this.otherUserInput.username !== this.otherUser?.username
    ) {
      this.currentUser = this.currentUserInput;
      this.otherUser = this.otherUserInput;
      this.setupChat();
    }
  }

  resetData() {
    this.chatMessages = [];
    this.offset = 0;
    this.otherUserStatus = null;
    this.lastSeenMessageRelativeIndex = -1;
    this.model.reset();
    this.closeSockets();
  }

  closeSockets() {
    this.statusWebSocket$?.complete();
    this.statusSubscription?.unsubscribe();
    this.statusWebSocket$ = null;

    this.chatWebSocket$?.complete();
    this.chatSubscription?.unsubscribe();
    this.chatWebSocket$ = null;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.closeSockets();
  }
}
