// Import Angular packages
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';

// Import Models
import { ChatMessage } from 'src/app/models/chatMessage';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent implements OnInit {
  @Input()
  isOtherUser!: boolean;

  @Input()
  isLastSeenMessage!: boolean;

  @Input()
  chatMessage!: ChatMessage;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const btnElement = (<HTMLElement>this.el.nativeElement).querySelector(
      '.url-field'
    );

    if (btnElement)
      this.renderer.listen(btnElement, 'click', () => {
        window.location.href = btnElement.innerHTML;
      });
  }

  sanitizeHTML(text: string) {
    let lt = /</gi;
    let gt = />/gi;

    text = text.replace(lt, '&lt;');

    text = text.replace(gt, '&gt;');

    return text;
  }

  processTextMessage(text: string) {
    let result: string[] = [];
    let n = 20;

    let link =
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

    let words = text.split(' ');

    let line = '';
    let processedLine = '';

    words.forEach((word) => {
      if (line.length + word.length > n && line.length !== 0) {
        result.push(processedLine);
        line = '';
        processedLine = '';
      }

      if (word.length > n) {
        let matches = word.match(link);
        let isURL = false;

        if (matches?.length) {
          isURL = true;
          processedLine += '<a class="url-field"  href=' + matches[0] + '>';
        }

        while (word.length) {
          line = word.substring(0, n);
          processedLine += this.sanitizeHTML(word.substring(0, n));

          if (line.length == n) {
            result.push(processedLine);
            processedLine = '';
          }

          word = word.substring(n);
        }

        if (isURL) processedLine += '</a>';
      }

      line += word + ' ';
      processedLine += this.sanitizeHTML(word) + ' ';

      let matches = word.match(link);

      if (matches?.length)
        processedLine = processedLine.replace(
          link,
          '<a class="url-field"  href=' + matches[0] + '>' + matches[0] + '</a>'
        );
    });

    if (processedLine.length) result.push(processedLine);

    return result.join('<br>').trim();
  }

  ngOnInit(): void {}
}
