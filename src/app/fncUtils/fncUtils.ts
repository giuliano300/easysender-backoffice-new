import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";

export interface ComuniCap {
  cap: string;
  denominazione_ita: string;
  sigla_provincia: string;
}

export interface ComuniXLS {
  cap: string;
  comune: string;
  sigla: string;
}

export class FncUtils {

   constructor(private http: HttpClient) {}

    static checkPasswordStrength(password: string): 'debole' | 'media' | 'forte' {
      const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
      const varietyScore = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  
      const totalScore = lengthScore + varietyScore;
  
      if (totalScore <= 2) return 'debole';
      if (totalScore === 3 || totalScore === 4) return 'media';
      return 'forte';
    }

      
    static GetFormattedData(d: string): string{
      const data = new Date(d);
        const dataFormattata = data.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/Rome',
        });

        return dataFormattata;
      }


      static getNazioniList(http: HttpClient): Observable<string[]> {
        return http.get<string[]>('/assets/json/upu.json').pipe(
          map((data) =>
            data.map((nazione) =>
              nazione
                .toLowerCase()
                .replace('citt� del vaticano', 'città del vaticano')
                .replace('indon�sie', 'indonésie')
                .replace('per�', 'perù')
                .toUpperCase()
            )
          )
        );
      }

      static getComuniList(http: HttpClient): Observable<ComuniXLS[]> {
        return http.get<ComuniCap[]>('/assets/json/gi_comuni_cap.json').pipe(
          map(comuni => comuni.map(c => ({
            cap: c.cap,
            comune: c.denominazione_ita,
            sigla: c.sigla_provincia
          })))
        );
      }

      static base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }

      static formatPrice(price: number): string{
        return new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(price);
      }
      
    static generateGuid(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    static getFileFromBase64(base64String: string): Blob {
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      return blob;

    }
  }

