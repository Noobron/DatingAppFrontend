// Import Angular packages
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// Import other npm packages
import { ToastrModule } from 'ngx-toastr';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
    }),
    SlickCarouselModule,
  ],
  exports: [BsDropdownModule, ToastrModule, SlickCarouselModule],
})
export class SharedModule {}
