import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/api/auth.service';
import { ConstantsService } from '../services/constants.service';
import { UserService } from '../services/api/user.service';

/**
 * Protects the private area: the session token must be valid on the server
 */
export const authGuard: CanActivateFn = (route, state) => {
  const oAuthService = inject(AuthService);
  const oConstantsService = inject(ConstantsService);
  const oRouter = inject(Router);
  const oUserService = inject(UserService);

  if (!oAuthService.getTokenObject()?.access_token) {
    return oRouter.parseUrl('/login');
  }

  // User already validated in this app instance: later invalidations are handled by the AuthErrorInterceptor
  if (oConstantsService.getUser()) {
    return true;
  }

  return oUserService.getUser().pipe(
    map((oResponse) => {
      oConstantsService.setUser(oResponse);
      return true;
    }),
    catchError(() => of(oRouter.parseUrl('/login')))
  );
};
