import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../main';
import { AutomationRuntimeSetting } from '../interfaces/AutomationRuntimeSetting';

@Injectable({ providedIn: 'root' })
export class AutomationSettingsService {
  private readonly apiUrl = API_URL + 'AutomationSettings';
  constructor(private readonly http: HttpClient) {}
  getAll(): Observable<AutomationRuntimeSetting[]> { return this.http.get<AutomationRuntimeSetting[]>(this.apiUrl); }
  save(setting: AutomationRuntimeSetting): Observable<AutomationRuntimeSetting> {
    return this.http.put<AutomationRuntimeSetting>(`${this.apiUrl}/${encodeURIComponent(setting.automationKey)}`, { enabled: setting.enabled, startTime: setting.startTime || null, endTime: setting.endTime || null, intervalMinutes: setting.intervalMinutes, batchSize: setting.batchSize });
  }
  restart(setting: AutomationRuntimeSetting): Observable<AutomationRuntimeSetting> { return this.http.post<AutomationRuntimeSetting>(`${this.apiUrl}/${encodeURIComponent(setting.automationKey)}/restart`, {}); }
  runNow(setting: AutomationRuntimeSetting): Observable<AutomationRuntimeSetting> { return this.http.post<AutomationRuntimeSetting>(`${this.apiUrl}/${encodeURIComponent(setting.automationKey)}/run-now`, {}); }
}
