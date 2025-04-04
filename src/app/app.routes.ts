import {Routes} from '@angular/router';

import {AccountComponent} from './views/account/account.component';
import {DashboardComponent} from './views/dashboard/dashboard.component';
import {LoginViewComponent} from './views/login-view/login-view.component';
import {MonitorComponent} from './views/monitor/monitor.component';
import {PublicHomeComponent} from './views/public-home/public-home.component';
import {SignUpComponent} from './views/sign-up/sign-up.component';
import {
  ConfirmInvitedUserRegistrationComponent
} from './views/confirm-invited-user-registration/confirm-invited-user-registration.component';
import {authGuard} from './auth/auth.guard';
import {isLoggedGuard} from './auth/is-logged.guard';
import {
  ConfirmAdminRegistrationComponent
} from "./views/confirm-admin-registration/confirm-admin-registration.component";
import {EventsComponent} from "./views/events/events.component";
import {ConfirmChangeEmailComponent} from "./views/confirm-change-email/confirm-change-email.component";
import {ChangeForgetPasswordComponent} from "./views/change-forget-password/change-forget-password.component";
import {ForgetPasswordRequestComponent} from "./views/forget-password-request/forget-password-request.component";
import {PasswordExpiredComponent} from "./views/password-expired/password-expired.component";
import {SubscriptionBuySuccessComponent} from "./views/subscription-buy-success/subscription-buy-success.component";
import {UserAccountComponent} from "./views/account/user-account/user-account.component";
import {UserOrganizationComponent} from "./views/account/user-organization/user-organization.component";
import {UserSubscriptionsComponent} from "./views/account/user-subscriptions/user-subscriptions.component";
import {AreaOfOperationsComponent} from "./views/area-of-operations/area-of-operations.component";

export const routes: Routes = [
  {path: '', component: PublicHomeComponent, canActivate: [isLoggedGuard]},
  {
    path: 'account',
    component: AccountComponent, // layout component with toolbar + sidebar + <router-outlet>
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' }, // default inside /account
      { path: 'user', component: UserAccountComponent },
      { path: 'organization', component: UserOrganizationComponent },
      { path: 'subscriptions', component: UserSubscriptionsComponent },
      { path: 'area-of-operations', component: AreaOfOperationsComponent },
    ]
  },
  {path: 'events/:aoiId', component: EventsComponent, canActivate: [authGuard]},
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
  {path: 'sign-up', component: SignUpComponent, canActivate: [isLoggedGuard]},
  {
    path: 'user/confirm',
    component: ConfirmInvitedUserRegistrationComponent,

  },
  {
    path: 'user/confirm-change-email',
    component: ConfirmChangeEmailComponent,

  },
  {
    path: 'user/confirm-forget-password',
    component: ChangeForgetPasswordComponent,

  },
  {
    path: 'forget-password',
    component: ForgetPasswordRequestComponent,
  },
  {
    path: 'password-expired/:userId',
    component: PasswordExpiredComponent,
  },
  {
    path: 'auth/confirm_adm',
    component: ConfirmAdminRegistrationComponent,
  },
  {
    path: 'subscription/success/:CHECKOUT_SESSION_ID',
    component: SubscriptionBuySuccessComponent,
  },
];
