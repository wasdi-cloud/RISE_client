import { Routes } from '@angular/router';

import { AccountComponent } from './views/account/account.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { MonitorComponent } from './views/monitor/monitor.component';
import { PublicHomeComponent } from './views/public-home/public-home.component';
import { SignUpComponent } from './views/sign-up/sign-up.component';
import { ConfirmRegistrationComponent } from './views/confirm-registration/confirm-registration.component';
import { authGuard } from './auth/auth.guard';
import { isLoggedGuard } from './auth/is-logged.guard';

export const routes: Routes = [
  { path: '', component: PublicHomeComponent, canActivate: [isLoggedGuard] },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginViewComponent,
    canActivate: [isLoggedGuard],
  },
  {
    path: 'monitor/:aoiId',
    component: MonitorComponent,
    canActivate: [authGuard],
  },
  { path: 'sign-up', component: SignUpComponent, canActivate: [isLoggedGuard] },
  {
    path: 'user/confirm',
    component: ConfirmRegistrationComponent,

  },
];
