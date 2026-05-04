import {Component, HostListener, AfterViewInit} from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { Router } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [PublicNavbarComponent, PublicFooterComponent, RiseButtonComponent],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css',
})
export class PublicHomeComponent implements AfterViewInit {
  constructor(private m_oRouter: Router) {}

  ngAfterViewInit(): void {
    const oObserverOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const oObserver = new IntersectionObserver((oEntries) => {
      oEntries.forEach(oEntry => {
        if (oEntry.isIntersecting) {
          oEntry.target.classList.add('is-visible');
        }
      });
    }, oObserverOptions);

    const aRevealElements = document.querySelectorAll('.reveal-on-scroll');
    aRevealElements.forEach(oEl => oObserver.observe(oEl));

    this.startTypingEffect();
  }

  private startTypingEffect(): void {
    let i = 0;
    const nSpeed = 40; // typing speed in ms

    const type1 = () => {
      if (i < this.m_sFullPart1.length) {
        this.m_sTypedPart1 += this.m_sFullPart1.charAt(i);
        i++;
        setTimeout(type1, nSpeed);
      } else {
        i = 0;
        type2();
      }
    };

    const type2 = () => {
      if (i < this.m_sFullPart2.length) {
        this.m_sTypedPart2 += this.m_sFullPart2.charAt(i);
        i++;
        setTimeout(type2, nSpeed);
      } else {
        i = 0;
        type3();
      }
    };

    const type3 = () => {
      if (i < this.m_sFullPart3.length) {
        this.m_sTypedPart3 += this.m_sFullPart3.charAt(i);
        i++;
        setTimeout(type3, nSpeed);
      }
    };

    type1();
  }
  m_bIsScrolled: boolean = false;
  m_sEmail:string="info@wasdi.cloud"

  // Typing effect variables
  m_sTypedPart1: string = '';
  m_sTypedPart2: string = '';
  m_sTypedPart3: string = '';
  private m_sFullPart1: string = 'Empowering action with ';
  private m_sFullPart2: string = 'near real-time';
  private m_sFullPart3: string = ' insights.';

  // Plugin interactive laptop state
  m_sSelectedPluginImage: string = 'assets/rise-assets/plugin_floods.png';
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
        this.m_sSelectedPluginImage = basePath + 'plugin_buildings.png';
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
