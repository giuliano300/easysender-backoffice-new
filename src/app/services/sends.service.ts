import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sends } from '../interfaces/Sends';
import { Reports } from '../interfaces/Reports';
import { TotalReport } from '../interfaces/TotalReport';
import { OperationListItem } from '../interfaces/OperationListItem';

@Injectable({
  providedIn: 'root'
})
export class SendsService {

  private apiUrl = API_URL + "Backoffice";

  constructor(private http: HttpClient) { }
  
  getSends(filters: {
    userId?: number;
    operationId?: number;
    startDate?: Date;
    endDate?: Date;
    sendType?: number;
    currentState?: number;
    productTypes?: number[];
    recipientName?: string;
    code?: string;
    noCod?: number;
    waitingMinutes?: number;
    pageIndex?: number;
    pageSize?: number;
    totalCounts?: number;
    } = {}): Observable<{ data: Sends[]; totalCount: number; arScansCount: number }> {

  const formatDate = (date: Date) => this.formatLocalDate(date);

    const params = new HttpParams({ fromObject: {
      ...(filters.totalCounts !== undefined && { totalCounts: filters.totalCounts }),
      ...(filters.pageIndex !== undefined && { pageIndex: filters.pageIndex }),
      ...(filters.pageSize !== undefined && { pageSize: filters.pageSize }),
      ...(filters.userId !== undefined && { userId: filters.userId }),
      ...(filters.operationId !== undefined && { operationId: filters.operationId }),
      ...(filters.startDate && { startDate: formatDate(filters.startDate) }),
      ...(filters.endDate && { endDate: formatDate(filters.endDate) }),
      ...(filters.sendType !== undefined && { sendType: filters.sendType }),
      ...(filters.currentState !== undefined && { currentState: filters.currentState }),
      ...(filters.productTypes?.length && { productTypes: filters.productTypes.join(',') }),
      ...(filters.recipientName && { recipientName: filters.recipientName }),
      ...(filters.code && { code: filters.code }),
      ...(filters.noCod !== undefined && { noCod: filters.noCod }),
      ...(filters.waitingMinutes !== undefined && { waitingMinutes: filters.waitingMinutes }),
    }});

    //console.log(params.toString());

    return this.http.get<{ data: Sends[]; totalCount: number; arScansCount: number }>(this.apiUrl + '/GetSends', { params });
  }

  unlockPendingSend(recipientId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/UnlockPending/${recipientId}`, {});
  }

  reportSend(recipientId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Report/${recipientId}`, {});
  }

  downloadArScan(recipientId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/GetArScan/${recipientId}`, {
      responseType: 'blob'
    });
  }

  getSend(recipientId: number): Observable<Sends> {
    return this.http.get<Sends>(this.apiUrl + "/GetSend/" + recipientId);
  }

  deleteSend(id: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + "/Send/" + id);
  }

  deleteOperation(operationId: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + "/Operation/" + operationId);
  }

  getOperations(filters: { search?: string; userId?: number; startDate?: Date; endDate?: Date; pageIndex?: number; pageSize?: number } = {}): Observable<{ data: OperationListItem[]; totalCount: number }> {
    const params = new HttpParams({ fromObject: {
      ...(filters.search && { search: filters.search }),
      ...(filters.userId !== undefined && { userId: filters.userId }),
      ...(filters.startDate && { startDate: this.formatLocalDate(filters.startDate) }),
      ...(filters.endDate && { endDate: this.formatLocalDate(filters.endDate) }),
      pageIndex: filters.pageIndex ?? 0,
      pageSize: filters.pageSize ?? 20
    } });
    return this.http.get<{ data: OperationListItem[]; totalCount: number }>(this.apiUrl + '/Operations', { params });
  }

  getReport(filters: {
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    sendType?: number;
    } = {}): Observable<Reports[]> {

    const formatDate = (date: Date) => this.formatLocalDate(date);

    const params = new HttpParams({ fromObject: {
        ...(filters.userId !== undefined && { userId: filters.userId }),
        ...(filters.startDate && { startDate: formatDate(filters.startDate) }),
        ...(filters.endDate && { endDate: formatDate(filters.endDate) }),
        ...(filters.sendType !== undefined && { sendType: filters.sendType }),
    }});

    return this.http.get<Reports[]>(this.apiUrl + '/GetReport', { params });
  }

  getTotalReport(filters: {
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    } = {}): Observable<TotalReport[]> {
 
    const formatDate = (date: Date) => this.formatLocalDate(date);

    const params = new HttpParams({ fromObject: {
      ...(filters.userId !== undefined && { userId: filters.userId }),
      ...(filters.startDate && { startDate: formatDate(filters.startDate) }),
      ...(filters.endDate && { endDate: formatDate(filters.endDate) }),
    }});

    console.log(params.toString());

    return this.http.get<TotalReport[]>(this.apiUrl + '/GetTotalReport', { params });
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
