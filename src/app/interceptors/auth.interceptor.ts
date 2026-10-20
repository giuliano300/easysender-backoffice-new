import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  const authenticatedRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError(error => {
      if (error.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginName');
        void router.navigate(['/authentication']);
      }

      return throwError(() => error);
    })
  );
};
