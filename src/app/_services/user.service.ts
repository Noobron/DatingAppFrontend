// Import Angular packages
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

// Import other dependencies
import { environment } from '../../environments/environment';
import { API_Paths } from '../api/paths';

// Import Interfaces
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseurl: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  // Get users in a (default) batch of 8
  getUsers(offset = 0, limit = 8) {
    return this.http.get<User[]>(this.baseurl + API_Paths.users, {
      params: {
        limit: limit,
        offset: offset,
      },
    });
  }

  // Get specific user
  getUser(name: string) {
    return this.http.get<User>(this.baseurl + API_Paths.users + name);
  }

  // Get Photos of a user
  getUserPhotos(name: string) {
    return this.http.get<{ image: SafeResourceUrl }[]>(
      this.baseurl + API_Paths.photos + name
    );
  }
}
