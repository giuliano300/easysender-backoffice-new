import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { StatusCheckDaily, StatusCheckRunDetails, StatusCheckRunFilter, StatusRecognitionIssues } from '../interfaces/status-check-daily';

@Injectable({ providedIn: 'root' })
export class StatusCheckDailyService {
  private readonly apiUrl = API_URL + 'StatusCheckDaily';
  constructor(private readonly http: HttpClient) {}
  get(date: string, pageIndex: number, pageSize: number, runFilter?: StatusCheckRunFilter): Observable<StatusCheckDaily> {
    const params: Record<string, string | number> = { date, pageIndex, pageSize };
    if (runFilter) params['runFilter'] = runFilter;
    return this.http.get<StatusCheckDaily>(this.apiUrl, { params });
  }
  getDetails(id: number): Observable<StatusCheckRunDetails> { return this.http.get<StatusCheckRunDetails>(`${this.apiUrl}/${id}/details`); }
  getStale(pageIndex: number, pageSize: number): Observable<StatusRecognitionIssues> {
    return this.http.get<StatusRecognitionIssues>(`${this.apiUrl}/stale`, { params: { pageIndex, pageSize } });
  }
  exportStale(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/stale/export`, { responseType: 'blob' });
  }
  retry(id: number): Observable<{ message: string; queuedRecipients: number; excludedFinalRecipients: number; manualRunRequested: boolean; }> {
    return this.http.post<{ message: string; queuedRecipients: number; excludedFinalRecipients: number; manualRunRequested: boolean; }>(`${this.apiUrl}/${id}/retry`, {});
  }
}
