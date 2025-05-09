import { HttpInterceptorFn } from '@angular/common/http';
import { ConstantsService } from '../constants.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../api/auth.service';

export const SessionInjectorInterceptor: HttpInterceptorFn = (req, next) => {
  const m_oAuthService = inject(AuthService);
  const m_oConstantsService = inject(ConstantsService);
  const m_oRouter = inject(Router);
  let sToken = m_oConstantsService.getSessionId();

  if (!sToken) {
    if (m_oAuthService.getTokenObject()) {
      sToken = m_oAuthService.getTokenObject().access_token;
      m_oConstantsService.setSessionId(sToken);
    }
  }

  if (sToken) {
    req = req.clone({
      setHeaders: {
        'x-session-token': sToken,
      },
    });  
  }

  return next(req);
};
