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
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }
}
