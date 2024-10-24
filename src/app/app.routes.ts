import { Routes } from '@angular/router';

import { AccountComponent } from './views/account/account.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { MonitorComponent } from './views/monitor/monitor.component';
import { PublicHomeComponent } from './views/public-home/public-home.component';
import { SignUpComponent } from './views/sign-up/sign-up.component';
import { CreateAreaOfOperationComponent } from './views/create-area-of-operation/create-area-of-operation.component';
import { AreaOfOperationsComponent } from './views/area-of-operations/area-of-operations.component';

export const routes: Routes = [
  { path: '', component: PublicHomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginViewComponent },
  { path: 'monitor/:aoiId', component: MonitorComponent },
  { path: 'sign-up', component: SignUpComponent },
];
