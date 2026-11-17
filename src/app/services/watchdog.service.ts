import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { WatchdogStatus } from '../interfaces/Watchdog';

@Injectable({ providedIn: 'root' })
export class WatchdogService {
  constructor(private http: HttpClient) {}
  getStatus(): Observable<WatchdogStatus> {
    return this.http.get<WatchdogStatus>(API_URL + 'Watchdog');
  }
}
