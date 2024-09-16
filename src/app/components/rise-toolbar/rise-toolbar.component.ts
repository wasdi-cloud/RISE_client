import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiseButtonComponent } from '../rise-button/rise-button.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-toolbar',
  standalone: true,
  imports: [CommonModule, RiseButtonComponent, TranslateModule],
  templateUrl: './rise-toolbar.component.html',
  styleUrl: './rise-toolbar.component.css'
})
export class RiseToolbarComponent {
  private m_bUserIsSigned: boolean = false;

  constructor(private m_oRouter: Router) { }

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
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }

}
