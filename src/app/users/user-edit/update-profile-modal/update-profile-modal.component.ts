// Import Angular packages
import { Component, OnInit } from '@angular/core';

// Import other dependencies
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-update-profile-modal',
  templateUrl: './update-profile-modal.component.html',
  styleUrls: ['./update-profile-modal.component.css'],
})
export class UpdateProfileModalComponent implements OnInit {
  profileUrl: SafeResourceUrl = "";
  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {}
}
