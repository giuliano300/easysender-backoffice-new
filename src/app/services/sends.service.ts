import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sends } from '../interfaces/Sends';
import { Reports } from '../interfaces/Reports';
import { TotalReport } from '../interfaces/TotalReport';

@Injectable({
  providedIn: 'root'
})
export class SendsService {

  private apiUrl = API_URL + "Backoffice";

  constructor(private http: HttpClient) { }
  
  getSends(filters: {
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    sendType?: number;
    currentState?: number;
    recipientName?: string;
    code?: string;
    noCod?: number;
    pageIndex?: number;
    pageSize?: number;
    totalCounts?: number;
    } = {}): Observable<{ data: Sends[]; totalCount: number; arScansCount: number }> {

  const formatDate = (date: Date) =>
    date.toISOString().split('T')[0];

    const params = new HttpParams({ fromObject: {
      ...(filters.totalCounts !== undefined && { totalCounts: filters.totalCounts }),
      ...(filters.pageIndex !== undefined && { pageIndex: filters.pageIndex }),
      ...(filters.pageSize !== undefined && { pageSize: filters.pageSize }),
      ...(filters.userId !== undefined && { userId: filters.userId }),
      ...(filters.startDate && { startDate: formatDate(filters.startDate) }),
      ...(filters.endDate && { endDate: formatDate(filters.endDate) }),
      ...(filters.sendType !== undefined && { sendType: filters.sendType }),
      ...(filters.currentState !== undefined && { currentState: filters.currentState }),
      ...(filters.recipientName && { recipientName: filters.recipientName }),
      ...(filters.code && { code: filters.code }),
      ...(filters.noCod !== undefined && { noCod: filters.noCod }),
    }});

    //console.log(params.toString());

    return this.http.get<{ data: Sends[]; totalCount: number; arScansCount: number }>(this.apiUrl + '/GetSends', { params });
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

  getReport(filters: {
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    sendType?: number;
    } = {}): Observable<Reports[]> {

    const formatDate = (date: Date) =>
      date.toISOString().split('T')[0];

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
 
    const formatDate = (date: Date) =>
      date.toISOString().split('T')[0];

    const params = new HttpParams({ fromObject: {
      ...(filters.userId !== undefined && { userId: filters.userId }),
      ...(filters.startDate && { startDate: formatDate(filters.startDate) }),
      ...(filters.endDate && { endDate: formatDate(filters.endDate) }),
    }});

    console.log(params.toString());

    return this.http.get<TotalReport[]>(this.apiUrl + '/GetTotalReport', { params });
  }

}
