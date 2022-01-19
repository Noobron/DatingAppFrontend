// Import Angular packages
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

// Import Models
import { User } from 'src/app/models/user';

// Import Services
import { UserService } from 'src/app/services/user/user-api.service';
import { AccountStatusService } from 'src/app/services/account/account-status.service';
import { AccountManagerService } from 'src/app/services/account/account-manager.service';

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

  webSocket$: WebSocketSubject<any> | null = null;

  userStatus: string | null = null;

  hasLiked = false;

  isLoggedIn = false;

  hasBeenLikedBy = false;

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
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private accountStatusService: AccountStatusService,
    private accountManagerService: AccountManagerService
  ) {
    let username = this.route.snapshot.paramMap.get('username')!;

    this.accountManagerService.currentAccount$.subscribe((acc) => {
      if (acc) {
        this.isLoggedIn = true;

        this.userService.hasLiked(username).subscribe((response) => {
          if (response) this.hasLiked = true;
        });

        this.userService.hasLiked(username, true).subscribe((response) => {
          if (response) this.hasBeenLikedBy = true;
        });
      } else this.isLoggedIn = false;
    });

    this.userService.getUser(username).subscribe((response) => {
      this.user = response;

      this.webSocket$ =
        this.accountStatusService.getAccountStatusSocket(username);

      this.webSocket$.subscribe((msg) => {
        if (msg.type === 'time' && msg.last_active !== undefined) {
          this.user!.lastActive = new Date(msg.last_active);
          this.userStatus = null;
        } else this.userStatus = msg.status;
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

  like() {
    if (this.isLoggedIn && this.user)
      this.userService.likeUser(this.user.username).subscribe(() => {
        this.hasLiked = true;
      });
    else this.router.navigate(['/login']);
  }

  unlike() {
    if (this.isLoggedIn && this.user)
      this.userService.unlikeUser(this.user.username).subscribe(() => {
        this.hasLiked = false;
      });
    else this.router.navigate(['/login']);
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

  chatToUser() {
    let objToSend: NavigationExtras = {
      queryParams: {
        user: this.user,
      },
      skipLocationChange: false,
      fragment: 'top',
    };

    this.router.navigate(['/chat'], {
      state: { userToChat: objToSend },
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.webSocket$?.complete();
    this.webSocket$ = null;
  }
}
