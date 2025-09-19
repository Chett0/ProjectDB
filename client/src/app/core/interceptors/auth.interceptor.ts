import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const JWT_Interceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('/refresh')) {
    return next(req); // Non intercettare il refresh stesso
  }

    const authService = inject(AuthService);

    const access_token : string | null = authService.getAccessToken();
    let authRequest = req;

    if (access_token) {
      authRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${access_token}`
        }
      });
    }
    return next(authRequest).pipe(
      catchError((error : HttpErrorResponse) => {
        if(error.status === 401) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getAccessToken();
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(newReq);
            })
          )
        }

        return throwError(() => error);
      })
    );
  }