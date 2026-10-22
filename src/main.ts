import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { isDevMode, LOCALE_ID } from '@angular/core';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeIt);

// In sviluppo le chiamate passano dal proxy Angular: in questo modo il browser
// le considera same-origin e non dipendono dalla policy CORS del server online.
const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const API_URL_DOC = isLocalDevelopment
  ? `${window.location.origin}/`
  : 'https://backendnew.easysender.it/';
export const API_URL = API_URL_DOC + 'api/';
export const exceedsLimit = 3;


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    { provide: LOCALE_ID, useValue: 'it-IT' }
  ]
}).catch(err => console.error(err));
