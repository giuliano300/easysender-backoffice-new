import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

    // Funzione per capitalizzare una stringa
    capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    // Altre funzioni generiche
    calculateSum(a: number, b: number): number {
      return a + b;
    }

    getEntries(obj: { [key: string]: string }): [string, string][] {
      return Object.entries(obj);
    }

    generateToken(length: number = 32): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let token = '';
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    }

    getDateFormatted(date: string | Date | null | undefined): string {
      if (!date) return '';
      
      const d = new Date(date);

      if (isNaN(d.getTime())) return ''; // Gestisce date non valide

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    getDateTimeFormatted(date: string | Date | null | undefined): string {
      if (!date) return '';

      // SQL datetime2 is serialized without a timezone suffix. These timestamps are
      // stored in UTC, so mark them as UTC before rendering them in Europe/Rome.
      const rawValue = typeof date === 'string' ? date.trim() : date;
      const timestampWithoutTimezone = typeof rawValue === 'string'
        && /^\d{4}-\d{2}-\d{2}[T ]/.test(rawValue)
        && !/(Z|[+-]\d{2}:?\d{2})$/i.test(rawValue);
      const value = new Date(timestampWithoutTimezone
        ? `${rawValue.replace(' ', 'T')}Z`
        : rawValue);
      if (isNaN(value.getTime())) return '';

      return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Rome'
      }).format(value);
    }

   GetMonth(): any[] {
    let m =  
    [
      { id: 1, name: "January" },
      { id: 2, name: "February" },
      { id: 3, name: "March" },
      { id: 4, name: "April" },
      { id: 5, name: "May" },
      { id: 6, name: "June" },
      { id: 7, name: "July" },
      { id: 8, name: "August" },
      { id: 9, name: "September" },
      { id: 10, name: "October" },
      { id: 11, name: "November" },
      { id: 12, name: "December" }
    ]

    return m;
};

}
