import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../interfaces/Login';
import { AuthResponse } from '../interfaces/AuthResponse';

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {

    private apiUrl = API_URL + "Auth";
    
    constructor(private http: HttpClient) {}

    login(login:Login): Observable<AuthResponse>{
      return this.http.post<AuthResponse>(this.apiUrl + "/loginAdmin", login);
    }

}
