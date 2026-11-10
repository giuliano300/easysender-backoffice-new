import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { DisasterRecoveryConfiguration, DisasterRecoveryStatus, UpdateDisasterRecoveryConfiguration } from '../interfaces/disaster-recovery';

@Injectable({ providedIn: 'root' })
export class DisasterRecoveryService {
  private readonly apiUrl = `${API_URL}DisasterRecovery`;
  constructor(private readonly http: HttpClient) {}

  get(): Observable<DisasterRecoveryStatus> { return this.http.get<DisasterRecoveryStatus>(this.apiUrl); }
  save(configuration: UpdateDisasterRecoveryConfiguration): Observable<DisasterRecoveryConfiguration> {
    return this.http.put<DisasterRecoveryConfiguration>(`${this.apiUrl}/configuration`, configuration);
  }
  runNow(): Observable<DisasterRecoveryConfiguration> { return this.http.post<DisasterRecoveryConfiguration>(`${this.apiUrl}/run-now`, {}); }
}
