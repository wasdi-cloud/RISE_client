import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiseButtonComponent } from '../rise-button/rise-button.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MapService } from '../../services/map.service';
import { RiseUserMenuComponent } from '../rise-user-menu/rise-user-menu.component';

@Component({
  selector: 'rise-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RiseButtonComponent,
    RiseUserMenuComponent,
    TranslateModule,
  ],
  templateUrl: './rise-toolbar.component.html',
  styleUrl: './rise-toolbar.component.css',
})
export class RiseToolbarComponent {
  @Input() public m_bUserIsSigned: boolean = false;

  constructor(private m_oMapService: MapService, private m_oRouter: Router) {}

  /**
   * Getter for user's logged-in/out status'
   * @returns boolean
   */
  public get userIsSigned(): boolean {
    return this.m_bUserIsSigned;
  }

  /**
   * Handle routing on clicks of visible buttons
   */
  public navigateRoute(sLocation: string) {
    if (sLocation === 'dashboard') {
      this.m_oMapService.closeWorkspace();
    }
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }
}
