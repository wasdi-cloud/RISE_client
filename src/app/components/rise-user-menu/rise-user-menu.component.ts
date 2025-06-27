import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {AuthService} from '../../services/api/auth.service';
import {ConstantsService} from '../../services/constants.service';
import {MapService} from '../../services/map.service';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {UserService} from '../../services/api/user.service';

import {UserRole} from '../../models/UserRole';
import {UserViewModel} from '../../models/UserViewModel';

import {DefaultMenuItems, FullMenuItems, ReducedMenuItems,} from './menu-items';
import {AreaService} from "../../services/api/area.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";
import {filter} from "rxjs";

@Component({
  selector: 'rise-user-menu',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, NgClass, RouterLink],
  templateUrl: './rise-user-menu.component.html',
  styleUrl: './rise-user-menu.component.css',
})
export class RiseUserMenuComponent implements OnInit {
  m_aoMenuItems: Array<any> = [];

  m_bShowDropdown: boolean = false;
  m_oUser: UserViewModel;
  m_bHasArea:boolean=false;
  m_bAlertShown: boolean = false;

  m_bShowLanguageDropdown: boolean = false;
  m_aoLanguages = [
    {
      name: 'English',
      value: 'en',
    },
    {
      name: 'Español',
      value: 'es',
    },
    {
      name: 'Français',
      value: 'fr',
    },
    {
      name: 'عربي',
      value: 'ar',
    },
    {
      name: "Italiano",
      value: 'it'
    }
  ];


  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService,
    private m_oAreaService: AreaService,
    private elementRef: ElementRef,

  ) {
    // this.m_aoMenuItems = DefaultMenuItems;
  }

  ngOnInit(): void {
    // this.initUserMenu();
    this.getUserMenu();
  }

  /**
   * Click handler for user inputs in dropdown state
   * @param sName
   * @param elRef
   */
  handleClick(sName, elRef?: HTMLElement): void {

    if (sName === 'language') {
      this.m_bShowLanguageDropdown = !this.m_bShowLanguageDropdown;
      return;
    }
    this.m_bShowLanguageDropdown = false; // Close language submenu on other clicks
    switch (sName) {
      case 'subscriptions':
        // let oNavExtra: NavigationExtras = {
        //   state: { m_sActiveOutlet: sName },
        // };
        // this.m_oRouter.navigate(['account'], oNavExtra);
        this.m_oRouter.navigateByUrl('account/subscriptions');
        this.m_bShowDropdown = false;
        break;
      case 'area of operations':
        // let oNavExtra: NavigationExtras = {
        //   state: { m_sActiveOutlet: sName },
        // };
        // this.m_oRouter.navigate(['account'], oNavExtra);
        this.m_oRouter.navigateByUrl('account/area-of-operations');
        this.m_bShowDropdown = false;
        break;
      case 'organization':
        // let oNavExtra: NavigationExtras = {
        //   state: { m_sActiveOutlet: sName },
        // };
        // this.m_oRouter.navigate(['account'], oNavExtra);
        this.m_oRouter.navigateByUrl('account/organization');
        this.m_bShowDropdown = false;
        break;
      case 'help':
        window.open('https://discord.gg/FkRu2GypSg', '_blank');
        this.m_bShowDropdown = false;
        break;
      case 'logout':
        this.m_bShowDropdown = false;
        this.m_oMapService.clearMarkerSubject(); // Clear the subject
        this.m_oAuthService.logout();
        break;
      case 'dashboard':
        this.m_oMapService.closeWorkspace();
        this.m_oRouter.navigateByUrl('dashboard');
        this.m_bShowDropdown = false;
        break;
      default:
        this.m_oRouter.navigateByUrl(sName);
        this.m_bShowDropdown = false;
    }
  }


  /**
   * Retrieve the appropriate menu item set based on user's location and Role
   */
  private getUserMenu(): void {
    const sError = this.m_oTranslate.instant('USER_MENU.ERROR');

    const applyMenuByPathAndRole = (sPath: string, sRole: string | null): void => {
      if (sPath.includes('account')) {
        this.m_aoMenuItems = ReducedMenuItems;
      } else if (sPath.includes('monitor')) {
        if (sRole === UserRole.FIELD) {
          this.m_aoMenuItems = FullMenuItems.filter(oItem => oItem.name !== 'subscriptions' && oItem.name !== 'organization' && oItem.name !== 'area of operations');
        } else {
          this.m_aoMenuItems = FullMenuItems;
        }
      } else {
        if (sRole === UserRole.FIELD) {
          this.m_aoMenuItems = DefaultMenuItems.filter(
            oItem => oItem.name !== 'subscriptions' && oItem.name !== 'organization' && oItem.name !== 'area of operations'
          );
        } else {
          this.m_aoMenuItems = DefaultMenuItems;
        }
      }
    };

    const resolveUserRoleAndApplyMenu = (sPath: string): void => {
      const oCachedRole = this.m_oConstantsService.getUserRole();
      if (oCachedRole) {
        applyMenuByPathAndRole(sPath, oCachedRole);
      } else {
        this.m_oUserService.getUser().subscribe({
          next: (user) => {
            const oUserRole = user.role;
            applyMenuByPathAndRole(sPath, oUserRole);
          },
          error: (oError) => {
            console.error(oError)
            // this.m_oNotificationService.openInfoDialog(sError, 'danger');
          }
        });
      }
    };

    const setupMenuHandling = (): void => {
      const sCurrentPath = this.m_oRouter.url;
      resolveUserRoleAndApplyMenu(sCurrentPath);

      // Also listen for route changes (NavigationEnd only)
      this.m_oRouter.events
        .pipe(filter(oEvent => oEvent instanceof NavigationEnd))
        .subscribe(() => {
          resolveUserRoleAndApplyMenu(this.m_oRouter.url);
        });
    };

    // MAIN FLOW
    this.m_oUser = this.m_oConstantsService.getUser();
    if (!this.m_oUser) {
      this.m_oUserService.getUser().subscribe({
        next: (oUser) => {
          this.m_oUser = oUser;
          this.m_oConstantsService.setUser(oUser);
          this.checkIfUserHasAreas();
          setupMenuHandling();
        },
        error: (oError) => {
          console.error(oError)
          // this.m_oNotificationService.openInfoDialog(sError, 'danger');
        }
      });
    } else {
      this.checkIfUserHasAreas();
      setupMenuHandling();
    }
  }

  /**
   * Toggle Dropdown visibility state
   */
  toggleDropdown(): void {
    this.m_bShowDropdown = !this.m_bShowDropdown;
    this.m_bAlertShown = true;
  }

  getRoleClass(role: UserRole): string {
    const roleClassMap: { [key in UserRole]: string } = {
      [UserRole.RISE_ADMIN]: 'role-badge-rise-admin',
      [UserRole.ADMIN]: 'role-badge-admin',
      [UserRole.HQ]: 'role-badge-hq',
      [UserRole.FIELD]: 'role-badge-field',
      [UserRole.SHARED]: 'role-badge-field'
    };

    return roleClassMap[role] || 'role-badge-default'; // Default if role is unknown
  }

  private checkIfUserHasAreas() {
    this.m_oAreaService.getAreaList().subscribe({
      next:(oResponse)=>{
        this.m_bHasArea = !(oResponse == null || oResponse.length == 0);
      }
    })
  }

  changeLanguage(value: string) {
    // //todo change the languege


    this.m_oUser = this.m_oConstantsService.getUser();
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUser)) {
      //there is no user
      this.m_oUserService.getUser().subscribe({
        next: (oResponse) => {
          this.m_oConstantsService.setUser(oResponse);
          this.m_oUser = oResponse;
          this.m_oUser.defaultLanguage = value;
          this.m_oUserService.changeUserLanguageSetting(this.m_oUser).subscribe({
            next: (oResponse) => {
              this.m_oTranslate.use(this.m_oUser.defaultLanguage);
              this.m_bShowLanguageDropdown = false;
              this.m_bShowDropdown = false;
            },
            error: (oError) => {
              console.error(oError);
              this.m_bShowLanguageDropdown = false;
              this.m_bShowDropdown = false;
            },
          });
        },
        error:(oError)=>{
          console.error(oError)
          this.m_bShowLanguageDropdown = false;
          this.m_bShowDropdown = false;
        }
      })
    } else {
      this.m_oUser.defaultLanguage = value;

      this.m_oUserService.changeUserLanguageSetting(this.m_oUser).subscribe({
        next: (oResponse) => {
          this.m_oTranslate.use(this.m_oUser.defaultLanguage);
          this.m_bShowLanguageDropdown = false;
          this.m_bShowDropdown = false;

        },
        error: (oError) => {
          console.error(oError);
          this.m_bShowLanguageDropdown = false;
          this.m_bShowDropdown = false;

        },
      });
    }

  }
  /**
   * Listen for clicks on the document to close the dropdown if the click is outside.
   * @param event The click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Check if the menu is open and the clicked element is not inside the menu component's element
    if (this.m_bShowDropdown && !this.elementRef.nativeElement.contains(event.target)) {
      this.m_bShowDropdown = false;
      this.m_bShowLanguageDropdown = false; // Also close language dropdown if open
    }
  }
  protected readonly UserRole = UserRole;
}
