import {Component, HostListener} from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { Router } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [PublicNavbarComponent, PublicFooterComponent, TranslateModule, RiseButtonComponent],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css',
})
export class PublicHomeComponent {
  constructor(private m_oRouter: Router) {}
  m_bIsScrolled: boolean = false;
  m_sEmail:string="info@wasdi.cloud"

  // Plugin interactive laptop state
  m_sSelectedPluginImage: string = 'assets/rise-assets/RISE_Platform_preview 1.png';
  m_sSelectedPlugin: string = 'Floods';

  selectPluginImage(pluginName: string) {
    this.m_sSelectedPlugin = pluginName;
    const basePath = 'assets/rise-assets/';
    switch (pluginName) {
      case 'Floods':
        this.m_sSelectedPluginImage = basePath + 'plugin_floods.png';
        break;
      case 'Droughts':
        this.m_sSelectedPluginImage = basePath + 'plugin_droughts.png';
        break;
      case 'Buildings':
        this.m_sSelectedPluginImage = basePath + 'plugin_buildings.jpg';
        break;
      case 'Impacts':
        this.m_sSelectedPluginImage = basePath + 'plugin_impacts.png';
        break;
      case 'Rain Observations':
        this.m_sSelectedPluginImage = basePath + 'plugin_rain.png';
        break;
      case 'Land Surface Temperature':
        this.m_sSelectedPluginImage = basePath + 'plugin_temperature.png';
        break;
      case 'Wildfires':
        this.m_sSelectedPluginImage = basePath + 'plugin_wildfires.png';
        break;
      default:
        this.m_sSelectedPluginImage = basePath + 'RISE_Platform_preview 1.png';
    }
  }

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
    this.m_oRouter.navigateByUrl(sRouter).then(() => {
      window.scrollTo(0, 0);
    });
  }
  handleLanguageChange(sEvent){
    console.log(sEvent);
  }

  contactUs() {
    // Define the target email address
    const sRecipient = this.m_sEmail;

    // Optional: Add a sSubject line for better user experience
    const sSubject = 'Contact request ';

    // Optional: Add some default sBody text
    const sBody = 'Hello, I am contacting you regarding...';

    // Construct the full mailto: URL.
    // We use encodeURIComponent to handle spaces and special characters correctly.
    const sMailtoLink = `mailto:${sRecipient}?subject=${encodeURIComponent(sSubject)}&body=${encodeURIComponent(sBody)}`;

    // Use the window object to open the mail application
    window.location.href = sMailtoLink;
  }
}
