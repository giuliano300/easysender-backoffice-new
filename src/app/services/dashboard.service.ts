import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetDashboardStats } from '../interfaces/GetDashboardStats';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = API_URL + "Backoffice";

  constructor(private http: HttpClient) { }
  
  getDashboard(filter?: string): Observable<GetDashboardStats> {
    return this.http.get<GetDashboardStats>(this.apiUrl + "/Dashboard");
  }

}
