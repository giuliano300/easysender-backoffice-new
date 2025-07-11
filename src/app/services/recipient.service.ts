import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetDettaglioDestinatario } from '../interfaces/GetDettaglioDestinatario';
import { UpdateRecipient } from '../interfaces/UpdateRecipient';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {

  private apiUrl = API_URL + "Recipients";

  constructor(private http: HttpClient) { }
  
  getDettaglioDestinatario(id: number): Observable<GetDettaglioDestinatario> {
    return this.http.get<GetDettaglioDestinatario>(this.apiUrl + '/GetDettaglioDestinatario?id=' + id);
  }

  UpdateAndResend(s: UpdateRecipient): Observable<boolean> {
    return this.http.put<boolean>(this.apiUrl + '/UpdateAndResend', s);
  }

}
