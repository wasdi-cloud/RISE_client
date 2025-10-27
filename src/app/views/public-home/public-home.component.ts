import {Component, HostListener} from '@angular/core';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { Router } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [RiseToolbarComponent, TranslateModule],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css',
})
export class PublicHomeComponent {
  constructor(private m_oRouter: Router) {}
  m_bIsScrolled: boolean = false;

  // Set the threshold for when the blur should be applied (e.g., after 50 pixels of scrolling)
  private readonly SCROLL_THRESHOLD = 50;

  // Use HostListener to listen for the 'scroll' event on the window
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Check the vertical scroll position (in pixels)
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Toggle the m_bIsScrolled property
    this.m_bIsScrolled = scrollY > this.SCROLL_THRESHOLD;
  }
  navigateRoute(sRouter: string) {
    this.m_oRouter.navigateByUrl(sRouter);
  }
  handleLanguageChange(sEvent){
    console.log(sEvent);
  }
}
