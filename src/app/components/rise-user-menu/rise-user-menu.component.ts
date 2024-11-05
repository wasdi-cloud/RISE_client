import { Component, OnInit } from '@angular/core';
import { DefaultMenuItems, ReducedMenuItems } from './menu-items';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationExtras,
  Router,
} from '@angular/router';
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

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oRouter: Router
  ) {
    this.m_aoMenuItems = DefaultMenuItems;
  }

  ngOnInit(): void {
    this.m_oActivatedRoute.url.subscribe((params) => {
      let bInAccount = params.toString().includes('account');
      !bInAccount
        ? (this.m_aoMenuItems = DefaultMenuItems)
        : (this.m_aoMenuItems = ReducedMenuItems);
    });
  }

  handleClick(sName) {
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
        // TODO: Execute actual logout here
        this.m_oRouter.navigateByUrl('login');
        break;
      default:
        this.m_oRouter.navigateByUrl(sName);
    }
  }

  /**
   * Support function to check if the account button should be replaced with dashboard
   */
  hideAccount() {
    return true;
  }

  toggleDropdown() {
    this.m_bShowDropdown = !this.m_bShowDropdown;
  }
}
