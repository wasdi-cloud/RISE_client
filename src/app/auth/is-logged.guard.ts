import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ConstantsService } from '../services/constants.service';
import { AuthService } from '../services/api/auth.service';
import { UserService } from '../services/api/user.service';

/**
 * Used on login/register pages: if the user has a valid session, go directly to the dashboard
 */
export const isLoggedGuard: CanActivateFn = (route, state) => {
  const oConstantsService = inject(ConstantsService);
  const oRouter = inject(Router);
  const oAuthService = inject(AuthService);
  const oUserService = inject(UserService);

  if (oConstantsService.getUser()) {
    return oRouter.parseUrl('/dashboard');
  }

  if (!oAuthService.getTokenObject()?.access_token) {
    return true;
  }

  // A stale token is cleared by the AuthErrorInterceptor: just show the page
  return oUserService.getUser().pipe(
    map((oResponse) => {
      oConstantsService.setUser(oResponse);
      return oRouter.parseUrl('/dashboard');
    }),
    catchError(() => of(true))
  );
};
