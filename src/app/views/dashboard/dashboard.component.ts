import { Component } from '@angular/core';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RiseToolbarComponent, RiseButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private m_oRouter: Router) { }

  public navigateRoute(sRoute: string): void {
    this.m_oRouter.navigateByUrl(sRoute)
  }
}
