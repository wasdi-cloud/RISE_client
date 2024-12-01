import {Component, OnInit} from '@angular/core';
import {DefaultMenuItems, FullMenuItems, ReducedMenuItems,} from './menu-items';
import {NgFor, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {MapService} from '../../services/map.service';
import {AuthService} from '../../services/api/auth.service';
import {UserService} from '../../services/api/user.service';
import {UserViewModel} from '../../models/UserViewModel';
import {ConstantsService} from '../../services/constants.service';
import {UserRole} from "../../models/UserRole";

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
    private m_oRouter: Router,
    private m_oUserService: UserService
  ) {
    this.m_aoMenuItems = DefaultMenuItems;
  }

  ngOnInit(): void {
    this.initUserMenu();
    this.getUserMenu();
  }

  handleClick(sName) {
    switch (sName) {
      case 'subscriptions':
        let oNavExtra: NavigationExtras = {
          state: {m_sActiveOutlet: sName},
        };
        this.m_oRouter.navigate(['account'], oNavExtra);
        break;
      case 'help':
        window.open('https://discord.gg/FkRu2GypSg', '_blank');
        break;
      case 'logout':
        this.m_oAuthService.logout();
        // TODO: Execute actual logout here

        break;
      case 'dashboard':
        this.m_oMapService.closeWorkspace();
        this.m_oRouter.navigateByUrl('dashboard');
        break;
      default:
        this.m_oRouter.navigateByUrl(sName);
    }
  }

  toggleDropdown() {
    this.m_bShowDropdown = !this.m_bShowDropdown;
  }

  private initUserMenu() {
    if (!this.m_oUser?.role) {
      this.m_oUserService.getUser().subscribe({
        next: (oResponse) => {
          this.m_oUser = oResponse;
          this.m_oConstantsService.setUser(this.m_oUser);
          if (this.m_oUser.role == UserRole.FIELD) {
            this.m_aoMenuItems = DefaultMenuItems.filter(item => item.name != 'subscriptions');

          } else {
            this.m_aoMenuItems = DefaultMenuItems;
          }

        },
        error: (oError) => {
          console.error(oError);
        },
      });
    }

  }

  private getUserMenu() {
    this.m_oUser = this.m_oConstantsService.getUser();

    if (!this.m_oUser) {
      this.m_oUserService.getUser().subscribe({
        next: (oResponse) => {
          this.m_oUser = oResponse;
          this.m_oConstantsService.setUser(this.m_oUser);
        },
        error: (oError) => {
          console.error(oError);
        },
      });
    }

    this.m_oActivatedRoute.url.subscribe((params) => {
      if (params.toString().includes('account')) {
        this.m_aoMenuItems = ReducedMenuItems
      } else if (params.toString().includes('monitor')) {
        let oUserRole = this.m_oConstantsService.getUserRole();
        if (!oUserRole) {
          this.m_oUserService.getUser().subscribe({
            next: (oResponse) => {
              oUserRole = oResponse.role;
            }
          })
        }
        if (oUserRole == UserRole.FIELD) {
          this.m_aoMenuItems = FullMenuItems.filter(item => item.name != 'subscriptions');
        } else {
          this.m_aoMenuItems = FullMenuItems
        }

      } else {
        let oUserRole = this.m_oConstantsService.getUserRole();
        if (!oUserRole) {
          this.m_oUserService.getUser().subscribe({
            next: (oResponse) => {
              oUserRole = oResponse.role;
            }
          })
        }
        if (oUserRole == UserRole.FIELD) {
          this.m_aoMenuItems = DefaultMenuItems.filter(item => item.name != 'subscriptions');

        } else {
          this.m_aoMenuItems = DefaultMenuItems;
        }

      }
    });
  }
}
