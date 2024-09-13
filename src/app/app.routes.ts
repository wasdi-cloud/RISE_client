import { Routes } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { PublicHomeComponent } from './views/public-home/public-home.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AccountComponent } from './views/account/account.component';
import { MonitorComponent } from './views/monitor/monitor.component';

export const routes: Routes = [
    { path: '', component: PublicHomeComponent },
    { path: 'account', component: AccountComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'login', component: LoginViewComponent },
    { path: 'monitor', component: MonitorComponent },
];
