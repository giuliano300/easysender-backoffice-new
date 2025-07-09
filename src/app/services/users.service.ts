import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompleteUser } from '../interfaces/CompleteUser';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = API_URL + "Users";

  constructor(private http: HttpClient) { }
  
  getUsers(filter?: string): Observable<CompleteUser[]> {
    return this.http.get<CompleteUser[]>(this.apiUrl + "/GetCompleteUsers?filter=" + filter);
  }

  getUserById(userId: number): Observable<CompleteUser> {
    return this.http.get<CompleteUser>(this.apiUrl + "/GetCompleteUsers/" + userId);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + "/" + userId);
  }

}
