import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompleteUser } from '../interfaces/CompleteUser';
import { Responses } from '../interfaces/Responses';
import { OpenApiVatReponses } from '../interfaces/OpenApiResponse/OpenApiVatReponses';
import { CompleteUserRegistration } from '../interfaces/UserRegistration/completeUserRegistration';
import { Child } from '../interfaces/Child';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = API_URL + "Users";

  constructor(private http: HttpClient) { }
  
  setUser(completeUser?: CompleteUserRegistration): Observable<number> {
    return this.http.post<number>(this.apiUrl + "/PostCompleteUser", completeUser);
  }

  updateUser(completeUser?: CompleteUserRegistration): Observable<number> {
    return this.http.post<number>(this.apiUrl + "/UpdateCompleteUser", completeUser);
  }

  setChildren(child?: Child): Observable<number> {
    return this.http.post<number>(this.apiUrl + "/SaveChildren", child);
  }

  updateChildren(child?: Child): Observable<number> {
    return this.http.post<number>(this.apiUrl + "/UpdateChildren", child);
  }

  getUsers(filter?: string, id?: number): Observable<CompleteUser[]> {
    const safeFilter = filter ?? '';
    const safeId = id ?? 0;

    return this.http.get<CompleteUser[]>(`${this.apiUrl}/GetCompleteUsers?filter=${safeFilter}&id=${safeId}`);
  }

  getUserById(userId: number): Observable<CompleteUser> {
    return this.http.get<CompleteUser>(this.apiUrl + "/GetCompleteUser/" + userId);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + "/" + userId);
  }
  
  existUser(vatNumber:string):Observable<Responses>{
    return this.http.get<Responses>(this.apiUrl + "/Exist?vatNumber=" + vatNumber);
  }

  checkVat(vatNumber:string):Observable<OpenApiVatReponses>{
    return this.http.get<OpenApiVatReponses>(this.apiUrl + "/CheckVat?vatNumber=" + vatNumber);
  }

  checkPosteAccess(usernamePoste:string, passwordPoste:string):Observable<boolean>{
    return this.http.get<boolean>(this.apiUrl + "/CheckPosteAccess?userName=" + usernamePoste + "&password=" + passwordPoste);
  }

}
