import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { UserService } from './services/api/user.service';

import FadeoutUtils from './shared/utilities/FadeoutUtils';

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
    private m_oUserService: UserService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit() {
    this.getUserInfo();
  }
  getUserInfo() {
    this.m_oUserService.getUser().subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          return;
        }
        if (oResponse.defaultLanguage) {
          this.m_oTranslate.use(oResponse.defaultLanguage.toLowerCase());
        }
      },
    });
  }
}
