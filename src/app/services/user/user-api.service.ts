// Import Angular packages
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Import Models
import { UserParams } from 'src/app/models/userParams';
import { Photo } from 'src/app/models/photo';

// Import other dependencies
import { environment } from '../../../environments/environment';
import { API_Paths } from '../../api/paths';

// Import Interfaces
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseurl: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  // Get users in a (default) batch of 8
  getUsers(offset = 0, limit = 8, userParams: UserParams | null = null) {
    let params: any = {
      limit: limit,
      offset: offset,
    };

    if (userParams) {
      params = {
        ...params,
        'min-age': userParams.minAge,
        'max-age': userParams.maxAge,
      };

      if (userParams.gender !== '')
        params = {
          ...params,
          gender: userParams.gender,
        };
    }

    return this.http.get<User[]>(this.baseurl + API_Paths.users, {
      params: params,
    });
  }

  // Get specific user
  getUser(name: string) {
    return this.http.get<User>(this.baseurl + API_Paths.users + name);
  }

  // Get Photos of a user
  getUserPhotos(name: string) {
    return this.http.get<Photo[]>(this.baseurl + API_Paths.photos + name);
  }

  // Save user information
  saveUserInfo(data: User) {
    return this.http.put<User>(this.baseurl + API_Paths.editProfile, data);
  }

  // Add Photo for a user
  addPhoto(data: FormData, reportProgress: boolean = false): Observable<any> {
    if (reportProgress === true) {
      const req = new HttpRequest(
        'POST',
        this.baseurl + API_Paths.addPhoto,
        data,
        {
          reportProgress: true,
        }
      );

      return this.http.request(req);
    }

    return this.http.post<Photo>(this.baseurl + API_Paths.addPhoto, data);
  }

  // Delete a photo of current user
  deletePhoto(id: string) {
    return this.http.delete<string>(this.baseurl + API_Paths.deletePhoto, {
      body: { id: id },
    });
  }

  // Like a user
  likeUser(toBeLiked: string) {
    return this.http.put(this.baseurl + API_Paths.likeUser, {
      to_be_liked: toBeLiked,
    });
  }

  // Unlike a user
  unlikeUser(likedOn: string) {
    return this.http.put(this.baseurl + API_Paths.unlikeUser, {
      liked_on: likedOn,
    });
  }

  // Check whether current user has liked a user
  hasLiked(likedOn: string, isInverse: boolean = false) {
    let params = new HttpParams();

    if (isInverse) params = params.append('inverse', '');

    return this.http.get(this.baseurl + API_Paths.hasLiked + likedOn, {
      params: params,
    });
  }
}
