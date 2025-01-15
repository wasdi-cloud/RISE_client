import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../services/api/auth.service';
import { ConstantsService } from '../../services/constants.service';
import { MapService } from '../../services/map.service';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { UserService } from '../../services/api/user.service';

import { UserRole } from '../../models/UserRole';
import { UserViewModel } from '../../models/UserViewModel';

import {
  DefaultMenuItems,
  FullMenuItems,
  ReducedMenuItems,
} from './menu-items';

@Component({
  selector: 'rise-user-menu',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule],
  templateUrl: './rise-user-menu.component.html',
  styleUrl: './rise-user-menu.component.css',
})
export class RiseUserMenuComponent implements OnInit {
  m_aoMenuItems: Array<any> = [];

  m_bShowDropdown: boolean = false;
  m_oUser: UserViewModel;

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService
  ) {
    // this.m_aoMenuItems = DefaultMenuItems;
  }

  ngOnInit(): void {
    // this.initUserMenu();
    this.getUserMenu();
  }

  /**
   * Initialize the user's information
   */
  private initUserMenu(): void {
    let sError: string = this.m_oTranslate.instant('USER_MENU.ERROR');
    if (!this.m_oUser?.role) {
      this.m_oUserService.getUser().subscribe({
        next: (oResponse) => {
          this.m_oUser = oResponse;
          this.m_oConstantsService.setUser(this.m_oUser);
          if (this.m_oUser.role == UserRole.FIELD) {
            this.m_aoMenuItems = DefaultMenuItems.filter(
              (item) => item.name != 'subscriptions'
            );
          } else {
            this.m_aoMenuItems = DefaultMenuItems;
          }
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(sError, 'danger');
        },
      });
    }
  }

  /**
   * Retrieve the appropriate menu item set based on user's location and Role
   */
  private getUserMenu(): void {
    let sError = this.m_oTranslate.instant('USER_MENU.ERROR');
    this.m_oUser = this.m_oConstantsService.getUser();

    if (!this.m_oUser) {
      this.m_oUserService.getUser().subscribe({
        next: (oResponse) => {
          this.m_oUser = oResponse;
          this.m_oConstantsService.setUser(this.m_oUser);
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(sError, 'danger');
        },
      });
    }

    this.m_oActivatedRoute.url.subscribe((params) => {
      console.log("active route changed")
      if (params.toString().includes('account')) {
        console.log("this is account")
        this.m_aoMenuItems = ReducedMenuItems;
      } else if (params.toString().includes('monitor')) {
        console.log("this is monitor")
        let oUserRole = this.m_oConstantsService.getUserRole();
        if (!oUserRole) {
          this.m_oUserService.getUser().subscribe({
            next: (oResponse) => {
              oUserRole = oResponse.role;
            },
          });
        }
        if (oUserRole == UserRole.FIELD) {
          this.m_aoMenuItems = FullMenuItems.filter(
            (item) => item.name != 'subscriptions'
          );
        } else {
          this.m_aoMenuItems = FullMenuItems;
        }
      } else {
        let oUserRole = this.m_oConstantsService.getUserRole();
        if (!oUserRole) {
          this.m_oUserService.getUser().subscribe({
            next: (oResponse) => {
              oUserRole = oResponse.role;
            },
          });
        }
        if (oUserRole == UserRole.FIELD) {
          this.m_aoMenuItems = DefaultMenuItems.filter(
            (item) => item.name != 'subscriptions'
          );
        } else {
          this.m_aoMenuItems = DefaultMenuItems;
        }
      }
    });
  }

  /**
   * Click handler for user inputs in dropdown state
   * @param sName
   */
  handleClick(sName): void {
    switch (sName) {
      case 'subscriptions':
        let oNavExtra: NavigationExtras = {
          state: { m_sActiveOutlet: sName },
        };
        this.m_oRouter.navigate(['account'], oNavExtra);
        break;
      case 'help':
        window.open('https://discord.gg/FkRu2GypSg', '_blank');
        break;
      case 'logout':
        this.m_oAuthService.logout();
        break;
      case 'dashboard':
        this.m_oMapService.closeWorkspace();
        this.m_oRouter.navigateByUrl('dashboard');
        break;
      default:
        this.m_oRouter.navigateByUrl(sName);
    }
  }

  /**
   * Toggle Dropdown visibility state
   */
  toggleDropdown(): void {
    this.m_bShowDropdown = !this.m_bShowDropdown;
  }
}
