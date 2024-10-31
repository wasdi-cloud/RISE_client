import { Component } from '@angular/core';
import { MenuItems } from './menu-items';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'rise-user-menu',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule],
  templateUrl: './rise-user-menu.component.html',
  styleUrl: './rise-user-menu.component.css',
})
export class RiseUserMenuComponent {
  m_aoMenuItems: Array<any> = MenuItems;

  m_bShowDropdown: boolean = false;

  constructor(private m_oRouter: Router) {}

  handleClick(sName) {
    switch (sName) {
      case 'subscriptions':
        let oNavExtra: NavigationExtras = {
          state: {m_sActiveOutlet: sName}
        }
        this.m_oRouter.navigate(['account'], oNavExtra)
        break;
      case 'help':
        window.open('https://discord.gg/FkRu2GypSg', '_blank');
        break;
      case 'logout':
        // TODO: Execute actual logout here
        this.m_oRouter.navigateByUrl('login');
        break;
      default:
        this.m_oRouter.navigateByUrl('account');
    }
  }

  toggleDropdown() {
    this.m_bShowDropdown = !this.m_bShowDropdown;
  }
}
