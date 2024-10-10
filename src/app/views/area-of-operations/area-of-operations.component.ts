import {Component} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {TranslateModule} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";

@Component({
  selector: 'app-area-of-operations',
  standalone: true,
  imports: [
    RiseButtonComponent,
    TranslateModule,
    RiseToolbarComponent
  ],
  templateUrl: './area-of-operations.component.html',
  styleUrl: './area-of-operations.component.css'
})
export class AreaOfOperationsComponent {

  constructor(
    private m_oRouter: Router
  ) {
  }

  public navigateRoute(sLocation: string) {
    //todo Admin registered the organization
    //todo The organization has a valid subscription or a valid credit card
    //todo HQ Operator has been added to the organization
    //todo HQ Operator selected New Area of Operations
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }
}
