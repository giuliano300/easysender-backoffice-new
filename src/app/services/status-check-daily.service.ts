import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { StatusCheckDaily, StatusCheckRunDetails } from '../interfaces/status-check-daily';

@Injectable({ providedIn: 'root' })
export class StatusCheckDailyService {
  private readonly apiUrl = API_URL + 'StatusCheckDaily';
  constructor(private readonly http: HttpClient) {}
  get(date: string): Observable<StatusCheckDaily> { return this.http.get<StatusCheckDaily>(this.apiUrl, { params: { date } }); }
  getDetails(id: number): Observable<StatusCheckRunDetails> { return this.http.get<StatusCheckRunDetails>(`${this.apiUrl}/${id}/details`); }
}
