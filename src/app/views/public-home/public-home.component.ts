import { Component } from '@angular/core';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { Router } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [RiseButtonComponent, RiseToolbarComponent, TranslateModule],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css',
})
export class PublicHomeComponent {
  constructor(private m_oRouter: Router) {}

  navigateRoute(sRouter: string) {
    this.m_oRouter.navigateByUrl(sRouter);
  }
  handleLanguageChange(sEvent){
    console.log(sEvent);
  }
}
