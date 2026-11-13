import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { CapUpdateConfiguration, CapUpdatesStatus } from '../interfaces/cap-updates';
@Injectable({ providedIn: 'root' })
export class CapUpdatesService {
  private readonly url = API_URL + 'CapUpdates';
  constructor(private readonly http: HttpClient) {}
  get(): Observable<CapUpdatesStatus> { return this.http.get<CapUpdatesStatus>(this.url); }
  save(value: CapUpdateConfiguration): Observable<CapUpdateConfiguration> { return this.http.put<CapUpdateConfiguration>(`${this.url}/configuration`, value); }
  checkNow(): Observable<void> { return this.http.post<void>(`${this.url}/check-now`, {}); }
  apply(): Observable<void> { return this.http.post<void>(`${this.url}/apply`, {}); }
}
