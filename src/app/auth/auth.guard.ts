import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { ConstantsService } from '../services/constants.service';
import { UserService } from '../services/api/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const m_oAuthService = inject(AuthService);
  const m_oConstantsService = inject(ConstantsService);
  const m_oRouter = inject(Router);
  const m_oUserService = inject(UserService);

  if (!m_oAuthService.getTokenObject()?.access_token) {
    m_oRouter.navigate(['login']);
    return false;
  }
  // If the User isn't set in the constants service
  if (!m_oConstantsService.getUser()) {
    m_oUserService.getUser().subscribe({
      next: (oResponse) => {
        m_oConstantsService.setUser(oResponse);
        return true;
      },
      error: (oError) => {
        m_oRouter.navigate(['login']);
        return false;
      },
    });
  }

  return true;
};
