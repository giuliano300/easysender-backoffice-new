import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GetDettaglioDestinatario } from '../interfaces/GetDettaglioDestinatario';
import { UpdateRecipient } from '../interfaces/UpdateRecipient';
import { Sends } from '../interfaces/Sends';
import { StatusResponses } from '../interfaces/StatusResponses';
import { StatusFileResponses } from '../interfaces/StatusFileResponses';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {

  private apiUrl = API_URL + "Recipients";
  private apiUrlStatus = API_URL + "RecuperaStati";

  constructor(private http: HttpClient) { }
  
  getDettaglioDestinatario(id: number): Observable<GetDettaglioDestinatario> {
    return this.http.get<GetDettaglioDestinatario>(this.apiUrl + '/GetDettaglioDestinatario?id=' + id);
  }

  UpdateAndResend(s: UpdateRecipient): Observable<boolean> {
    return this.http.put<boolean>(this.apiUrl + '/UpdateAndResend', s);
  }

  statusRetrive(s: Sends): Observable<StatusResponses>{
    switch(s.type.toUpperCase()){
      case "LOL":
        return this.http.get<StatusResponses>(this.apiUrlStatus + "/LOL/" + s.id);
      case "ROL":
        return this.http.get<StatusResponses>(this.apiUrlStatus + "/ROL/" + s.id);
      case "COL":
        return this.http.get<StatusResponses>(this.apiUrlStatus + "/COL/" + s.id);
      case "MOL":
        return this.http.get<StatusResponses>(this.apiUrlStatus + "/MOL/" + s.id);
      case "AGOL":
        return this.http.get<StatusResponses>(this.apiUrlStatus + "/AGOL/" + s.id);
      default:
        return of({ state: 400, message: "Errore generico" } as StatusResponses);
    }
  }

  requestFinalDoc(s: Sends): Observable<StatusFileResponses>{
    switch(s.type.toUpperCase()){
       case "MOL":
        return this.http.get<StatusFileResponses>(this.apiUrlStatus + "/DOCMOL/" + s.id)
      default:
        return of({ state: 400, message: "Errore generico", file: undefined } as StatusFileResponses);
    }
  }

}
