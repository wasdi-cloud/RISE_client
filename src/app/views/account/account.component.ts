import {Component, Input, OnInit} from '@angular/core';
import {RiseToolbarComponent} from '../../components/rise-toolbar/rise-toolbar.component';
import {TranslateModule} from '@ngx-translate/core';
import {NavigationEnd, Router} from '@angular/router';
import {AccountSidebarComponent} from './account-sidebar/account-sidebar.component';
import {AccountBtns} from './account-sidebar/account-btns';
import {UserAccountComponent} from './user-account/user-account.component';
import {CommonModule} from '@angular/common';
import {UserOrganizationComponent} from './user-organization/user-organization.component';
import {AreaOfOperationsComponent} from '../area-of-operations/area-of-operations.component';
import {UserSubscriptionsComponent} from './user-subscriptions/user-subscriptions.component';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {ConstantsService} from "../../services/constants.service";
import {UserService} from "../../services/api/user.service";
import {EventsComponent} from "../events/events.component";

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    AreaOfOperationsComponent,
    AccountSidebarComponent,
    CommonModule,
    RiseToolbarComponent,
    TranslateModule,
    UserAccountComponent,
    UserOrganizationComponent,
    UserSubscriptionsComponent,
    EventsComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  @Input() m_sActiveOutlet: string = 'user';

  m_aoAccountButtons: Array<any> ;

  constructor(
    private m_oRouter: Router,
    private m_oConstantService: ConstantsService,
    private m_oUserService: UserService,

  ) {}

  ngOnInit(): void {
    // Update on component initialization
    this.updateActiveOutletFromState();
    this.getActiveButtonsBasedOnUserRole();
    // Listen for navigation events to handle state updates dynamically
    this.m_oRouter.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActiveOutletFromState();
      }
    });
  }
  getActiveButtonsBasedOnUserRole(){
    let oUserRole=this.m_oConstantService.getUserRole();

    if(oUserRole===null){
      //try to get user
      this.m_oUserService.getUser().subscribe({
        next:(oResponse)=>{
          this.m_oConstantService.setUser(oResponse)
          this.m_aoAccountButtons = AccountBtns.filter(button =>
            button.role.includes(oResponse.role)
          );
        },
        error:()=>{
          this.m_aoAccountButtons=AccountBtns;
        }
      })
    }else {
      this.m_aoAccountButtons = AccountBtns.filter(button =>
        button.role.includes(oUserRole)
      );
    }
  }
  private updateActiveOutletFromState() {
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
