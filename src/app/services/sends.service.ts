import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sends } from '../interfaces/Sends';

@Injectable({
  providedIn: 'root'
})
export class SendsService {

  private apiUrl = API_URL + "Backoffice";

  constructor(private http: HttpClient) { }
  
  getSends(): Observable<Sends[]> {
    return this.http.get<Sends[]>(this.apiUrl + "/GetSends");
  }

  deleteSend(id: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + "/Send/" + id);
  }

}
