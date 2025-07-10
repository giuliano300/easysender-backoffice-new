import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeIt);

// Definisci l'URL globale dell'API
export const API_URL_DOC = 'http://localhost:5105/';
export const API_URL = API_URL_DOC + 'api/';
export const exceedsLimit = 3;


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'it-IT' }
  ]
}).catch(err => console.error(err));
