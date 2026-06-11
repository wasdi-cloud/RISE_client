import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';
import {UserService} from './services/api/user.service';
import {AuthService} from "./services/api/auth.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'rise-client';

  constructor(
    private m_oTranslate: TranslateService,
    private m_oUserService: UserService,
    private m_oAuthService: AuthService
  ) {
  }

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    if (!this.m_oAuthService.getTokenObject()?.access_token) {
      return;
    }

    this.m_oUserService.getUser().subscribe({
      next: (oResponse) => {
        if (!oResponse) {
          this.m_oAuthService.logout();
          return;
        }

        if (oResponse.defaultLanguage) {
          this.m_oTranslate.use(oResponse.defaultLanguage.toLowerCase());
        }
      },
      error: (oError: HttpErrorResponse) => {
        if (oError.status === 401) {
          this.m_oAuthService.logout();
        }
        return;
      }
    })
  }
}
