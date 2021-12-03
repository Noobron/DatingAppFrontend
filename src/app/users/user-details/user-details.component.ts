// Import Angular packages
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Import Models
import { User } from 'src/app/models/user';

// Import Services
import { UserService } from 'src/app/services/user/user-api.service';

// Import other dependencies
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;

  ABOUT: number = 0;
  INTERESTS: number = 1;
  PHOTOS: number = 2;

  public selectedIndex = 0;

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

  constructor(private userService: UserService, private route: ActivatedRoute) {
    this.userService
      .getUser(this.route.snapshot.paramMap.get('username')!)
      .subscribe((response) => {
        this.user = response;

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
}
