// Import Angular packages
import { Component, Input, OnInit } from '@angular/core';

// Import Models
import { ChatMessage } from 'src/app/models/chatMessage';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  @Input()
  isOtherUser!: boolean;

  @Input()
  isLastSeenMessage!: boolean;

  @Input()
  chatMessage!: ChatMessage;

  constructor() {}

  processTextMessage(text: string) {
    return text;
  }

  ngOnInit(): void {}
}
