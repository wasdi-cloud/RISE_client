import { Component, Input, OnInit } from '@angular/core';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountSidebarComponent } from './account-sidebar/account-sidebar.component';
import { AccountBtns } from './account-sidebar/account-btns';
import { UserAccountComponent } from './user-account/user-account.component';
import { CommonModule } from '@angular/common';
import { UserOrganizationComponent } from './user-organization/user-organization.component';
import { AreaOfOperationsComponent } from '../area-of-operations/area-of-operations.component';
import { UserSubscriptionsComponent } from './user-subscriptions/user-subscriptions.component';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    AreaOfOperationsComponent,
    AccountSidebarComponent,
    CommonModule,
    RiseToolbarComponent,
    RiseButtonComponent,
    TranslateModule,
    UserAccountComponent,
    UserOrganizationComponent,
    UserSubscriptionsComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  @Input() m_sActiveOutlet: string = 'user';

  m_aoAccountButtons: Array<any> = AccountBtns;

  constructor(private m_oRouter: Router) {}

  ngOnInit(): void {
    if (
      !FadeoutUtils.utilsIsObjectNullOrUndefined(
        history.state['m_sActiveOutlet']
      )
    ) {
      this.m_sActiveOutlet = history.state['m_sActiveOutlet'];
    }
  }

  public navigateRoute(sLocation: string) {
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }

  public getActiveOutlet(sSelectedOutlet: string) {
    if (sSelectedOutlet) {
      this.m_sActiveOutlet = sSelectedOutlet;
    }
  }
}
