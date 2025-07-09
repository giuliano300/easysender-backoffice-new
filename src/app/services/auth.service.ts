import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loginNameSubject = new BehaviorSubject<string>("");

  // Osservabili pubblici
  loginName$ = this.loginNameSubject.asObservable();

  // Imposta valori
  setLoginName(value: string) {
    localStorage.setItem('loginName', JSON.stringify(value));
    this.loginNameSubject.next(value);
  }

  // Pulisce i ruoli
  clearRoles() {
    localStorage.removeItem('isEntity');
    this.loginNameSubject.next("");
  }

  // Legge da localStorage
  private getBooleanFromStorage(key: string): boolean {
    return localStorage.getItem(key) === 'true';
  }
}
