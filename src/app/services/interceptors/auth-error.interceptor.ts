import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../api/auth.service';
import { authGuard } from '../../auth/auth.guard';

/**
 * Check if the current route (or one of its parents) is protected by the authGuard
 */
function isProtectedRoute(oRouter: Router): boolean {
  let oSnapshot: ActivatedRouteSnapshot = oRouter.routerState.snapshot.root;

  while (oSnapshot) {
    if (oSnapshot.routeConfig?.canActivate?.includes(authGuard)) {
      return true;
    }
    oSnapshot = oSnapshot.firstChild;
  }

  return false;
}

/**
 * Drop the local session when the server says that the session token is no longer valid
 * (invalid / expired session or expired password).
 * Users browsing the public site just go back to the anonymous state, while users
 * in the protected area are sent to the login.
 */
export const AuthErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const oAuthService = inject(AuthService);
  const oRouter = inject(Router);

  return next(req).pipe(
    catchError((oError: HttpErrorResponse) => {
      if (req.headers.has('x-session-token')) {
        const asCodes: string[] = oError?.error?.errorStringCodes ?? [];
        const bPasswordExpired = oError.status === 307 && asCodes.some((sCode) => sCode?.includes('WARNING_API_PASSWORD_EXPIRED'));

        if (oError.status === 401 || bPasswordExpired) {
          const bWasProtected = isProtectedRoute(oRouter);
          oAuthService.clearSession();

          if (bWasProtected) {
            oRouter.navigateByUrl('login');
          }
        }
      }

      return throwError(() => oError);
    })
  );
};
