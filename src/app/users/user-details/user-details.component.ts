// Import Angular packages
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Import Models
import { User } from 'src/app/_models/user';

// Import Services
import { UserService } from 'src/app/_services/user.service';

// Import other dependencies
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;

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
console.log(this.user!.lookingFor);
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
    this.selectedIndex = 0;
  }

  selectInterests() {
    this.selectedIndex = 1;
  }

  selectPhotos() {
    this.selectedIndex = 2;
  }

  ngOnInit(): void {}
}
