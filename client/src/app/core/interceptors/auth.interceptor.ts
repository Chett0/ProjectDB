import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { TokensService } from '../../services/tokens/tokens.service';

export const JWT_Interceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const tokenService = inject(TokensService);

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
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {

        return tokenService.refreshToken().pipe(
          switchMap(() => {
            const newToken = tokenService.getAccessToken();
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq);
          }),
          catchError((error) => {

            authService.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => err);
    })
  );
}