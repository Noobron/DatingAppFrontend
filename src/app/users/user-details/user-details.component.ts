// Import Angular packages
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Import Models
import { User } from 'src/app/models/user';

// Import Services
import { UserService } from 'src/app/services/user/user-api.service';
import { AccountStatusService } from 'src/app/services/account/account-status.service';

// Import other dependencies
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user: User | null = null;

  ABOUT: number = 0;
  INTERESTS: number = 1;
  PHOTOS: number = 2;

  public selectedIndex = 0;

  webSocket: WebSocketSubject<any> | null = null;

  userStatus: string | null = null;

  galleryOptions: NgxGalleryOptions[] = [
    {
      width: '500px',
      height: '500px',
      imagePercent: 100,
      thumbnailsColumns: 4,
      imageAnimation: NgxGalleryAnimation.Slide,
    },
  ];

  galleryImages: NgxGalleryImage[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private accountStatusService: AccountStatusService
  ) {
    let ussername = this.route.snapshot.paramMap.get('username')!;

    this.userService.getUser(ussername).subscribe((response) => {
      this.user = response;

      this.webSocket =
        this.accountStatusService.getAccountStatusSocket(ussername);

      this.webSocket.subscribe((msg) => {
        if ((msg.type = 'time' && msg.last_active != undefined))
          this.user!.lastActive = new Date(msg.last_active);
        else this.userStatus = msg.status;
      });

      this.userService
        .getUserPhotos(this.user.username)
        .subscribe((response) => {
          response.forEach((file) => {
            this.galleryImages.push({
              small: file.image,
              medium: file.image,
              big: file.image,
            });
          });
        });
    });
  }

  selectAbout() {
    this.selectedIndex = this.ABOUT;
  }

  selectInterests() {
    this.selectedIndex = this.INTERESTS;
  }

  selectPhotos() {
    this.selectedIndex = this.PHOTOS;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.webSocket?.complete();
    this.webSocket?.unsubscribe();
    this.webSocket = null;
  }
}
