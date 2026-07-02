import { Injectable } from '@angular/core';
import { API_URL } from '../../main';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomationDashboard } from '../interfaces/AutomationDashboard';

@Injectable({
  providedIn: 'root'
})
export class AutomationDashboardService {
  private apiUrl = API_URL + 'AutomationDashboard';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AutomationDashboard> {
    return this.http.get<AutomationDashboard>(this.apiUrl);
  }
}
