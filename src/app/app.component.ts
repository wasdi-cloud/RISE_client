import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';
import {UserService} from './services/api/user.service';
import {ConstantsService} from "./services/constants.service";

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
    private m_oConstantService: ConstantsService,
    private m_oUserService: UserService
  ) {
  }

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.m_oUserService.getUser().subscribe({
      next: (oResponse) => {
        if (oResponse.defaultLanguage) {
          this.m_oTranslate.use(oResponse.defaultLanguage.toLowerCase());
        }
      },
      error: (oError) => {
        return;
      }
    })
  }
}
