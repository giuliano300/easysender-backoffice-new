import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { AccountingMovement, AccountingPosition, AccountingSummary } from '../interfaces/accounting';

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private readonly apiUrl = `${API_URL}Accounting`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<AccountingSummary> { return this.http.get<AccountingSummary>(`${this.apiUrl}/Summary`); }

  getPositions(filters: { search?: string; userId?: number; status?: string; dueFrom?: Date; dueTo?: Date; pageIndex?: number; pageSize?: number } = {}): Observable<{ data: AccountingPosition[]; totalCount: number }> {
    const date = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    const params = new HttpParams({ fromObject: {
      ...(filters.search && { search: filters.search }),
      ...(filters.userId !== undefined && { userId: filters.userId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.dueFrom && { dueFrom: date(filters.dueFrom) }),
      ...(filters.dueTo && { dueTo: date(filters.dueTo) }),
      pageIndex: filters.pageIndex ?? 0,
      pageSize: filters.pageSize ?? 100
    } });
    return this.http.get<{ data: AccountingPosition[]; totalCount: number }>(this.apiUrl, { params });
  }

  getPosition(id: number): Observable<{ position: AccountingPosition; movements: AccountingMovement[] }> {
    return this.http.get<{ position: AccountingPosition; movements: AccountingMovement[] }>(`${this.apiUrl}/${id}`);
  }

  createPosition(payload: unknown): Observable<{ id: number }> { return this.http.post<{ id: number }>(this.apiUrl, payload); }
  addMovement(positionId: number, payload: unknown): Observable<void> { return this.http.post<void>(`${this.apiUrl}/${positionId}/Movements`, payload); }
}
