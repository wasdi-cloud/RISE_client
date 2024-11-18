import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConstantsService } from '../services/constants.service';
import { AuthService } from '../services/api/auth.service';
import { UserService } from '../services/api/user.service';

export const isLoggedGuard: CanActivateFn = (route, state) => {
  const m_oConstantsService = inject(ConstantsService);
  const m_oRouter = inject(Router);
  const m_oAuthService = inject(AuthService);
  const m_oUserService = inject(UserService);

  if (m_oConstantsService.getUser()) {
    m_oRouter.navigate(['dashboard']);
    return false;
  } else if (m_oAuthService.getTokenObject()?.access_token) {
    m_oUserService.getUser().subscribe({
      next: (oResponse) => {
        console.log(oResponse)
        m_oConstantsService.setUser(oResponse);
        m_oRouter.navigate(['dashboard']);
        return false;
      },
      error: (oError) => {
        m_oRouter.navigate(['']);
        return true;
      },
    });
  }
  return true;
};
