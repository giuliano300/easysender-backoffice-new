import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { StatusCheckDaily, StatusCheckRunDetails, StatusCheckRunFilter, StatusRecognitionIssues } from '../interfaces/status-check-daily';

export interface AgolCommunication { id: number; recipientId: number; objectType: string; trackingCode: string; status: string; latestCode?: string; latestMessage?: string; latestOutcomeAt?: string; shipmentDate: string; shipmentCode?: string; recipientName: string; userName: string; }

@Injectable({ providedIn: 'root' })
export class StatusCheckDailyService {
  private readonly apiUrl = API_URL + 'StatusCheckDaily';
  constructor(private readonly http: HttpClient) {}
  get(date: string, pageIndex: number, pageSize: number, runFilter?: StatusCheckRunFilter): Observable<StatusCheckDaily> {
    const params: Record<string, string | number | boolean> = { date, pageIndex, pageSize, includeStaleCount: false };
    if (runFilter) params['runFilter'] = runFilter;
    return this.http.get<StatusCheckDaily>(this.apiUrl, { params });
  }
  getDetails(id: number): Observable<StatusCheckRunDetails> { return this.http.get<StatusCheckRunDetails>(`${this.apiUrl}/${id}/details`); }
  getAgolCommunications(pageIndex: number, pageSize: number): Observable<{ data: AgolCommunication[]; totalCount: number }> { return this.http.get<{ data: AgolCommunication[]; totalCount: number }>(`${this.apiUrl}/agol-communications`, { params: { pageIndex, pageSize } }); }
  getAgolDeposited(pageIndex: number, pageSize: number): Observable<{ data: AgolCommunication[]; totalCount: number }> { return this.http.get<{ data: AgolCommunication[]; totalCount: number }>(`${this.apiUrl}/agol-communications`, { params: { pageIndex, pageSize, inGiacenza: true } }); }
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
