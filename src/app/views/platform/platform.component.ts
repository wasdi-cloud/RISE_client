import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [CommonModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.css',
})
export class PlatformComponent implements AfterViewInit {
  m_bIsConnectedVisible = false;
  m_sFullTagline = 'Always expanding. Always portable. Always improving.';
  m_sVisibleTagline = '';

  m_aoFaqs = [
    {
      question: 'How can my organization get started with RISE?',
      answer: 'You just need one valid e-mail to start with RISE. Go on the RISE sign-up page, insert registration data about you and your organization and, after the email confirmation, you are ready to start!\n\nOnce the organization is registered, the administrator can invite all the other colleagues, assigning the role of Administrator, Head Quarter Operator or Field Operator.',
      open: false
    },
    {
      question: 'What are the differences between Administrator, Head Quarter or Field Operator?',
      answer: 'To meet the needs of larger organizations, RISE offers three distinct user profiles. Smaller organizations can manage everything with just the first user created, but larger teams may benefit from assigning different roles:\n\n• <b>The Administrator:</b> has full control of the organization’s account. Can add/remove users, purchase subscriptions, and manage, create, or delete areas of operation.\n• <b>Headquarters Operators:</b> can access information from all areas, invite field operators and assign them to a specific area, purchase subscriptions, and manage, create, or delete areas of operation.\n• <b>Field Operators:</b> are users dedicated to a specific area. They can view all data available in the assigned area.',
      open: false
    },
    {
      question: 'Which organizations or sectors is RISE designed for, and how can it improve their workflows?',
      answer: 'RISE is built to support a wide range of organizations that rely on geospatial intelligence:\n\n• <b>Humanitarian Organization:</b> all the organizations with an active role on the field in the Humanitarian Context can benefit from RISE. RISE offers a cost-effective and efficient way to gather critical geospatial intelligence without needing extensive in-house resources. It empowers to monitor environmental changes, assess project impact, and identify areas of need with greater accuracy and speed.\n• <b>Agribusiness Companies:</b> RISE provides agribusiness corporations with unparalleled insights into their global supply chains, enabling them to enhance transparency, manage risks, and optimize agricultural practices. Through advanced satellite imagery and analytics, RISE helps companies monitor crop health, predict yields, and track deforestation, all while maintaining compliance with environmental regulations.\n• <b>Environmental Protection Agencies:</b> RISE offers Environmental Protection Agencies a powerful tool for enhanced environmental monitoring, regulatory compliance, and policy development. By providing timely and accurate satellite-derived data on land use, pollution, and ecosystem changes, RISE enables these agencies to detect environmental violations, assess the impact of regulations, and identify areas requiring intervention.\n• <b>Insurance Companies:</b> RISE can be leveraged by Insurance Companies to increase the efficiency in the protection against Natural Disasters, in the assessment of the damages and in the evaluation of the vulnerability. The ability to process the full satellite archive gives an unique insight about the vulnerability of an area and allows us to evaluate the impacts of the past events.',
      open: false
    },
    {
      question: 'What types of disasters can RISE monitor?',
      answer: 'RISE currently provides monitoring capabilities for <b>floods, droughts, heavy rain, and heat waves.</b> In addition to these, new features are being developed that will soon allow RISE to track <b>forest fires, air quality, and landslides.</b> This continuous expansion ensures that organizations can rely on RISE for timely and accurate insights.',
      open: false
    },
    {
      question: 'What sources does RISE use for its Earth Observation data?',
      answer: 'RISE leverages the WASDI Platform for the EO Processing, ensuring in this way the access to a huge number of satellite missions and processing algorithms. The most used source of data are Sentinel-1, Sentinel-2, Sentinel-3, Sentinel-5P, VIIRS, GFS.',
      open: false
    },
    {
      question: 'Can RISE be used on mobile devices like tablets or smartphones?',
      answer: 'The RISE user interface is currently optimized for personal computers and tablets. For smartphones, we recommend using our Telegram bot, which allows you to interact with RISE directly through chat and instantly receive maps on your device while working in the field.',
      open: false
    },
    {
      question: 'Does RISE support APIs or data exports?',
      answer: 'Yes. RISE allows users to download all maps either manually through the platform or via API. This ensures flexibility for organizations that want to integrate RISE outputs into their own systems or workflows.',
      open: false
    },
    {
      question: 'What languages does RISE support at the moment?',
      answer: 'Currently, RISE supports the following languages: <b>English, Spanish, French, Italian, and Arabic.</b>\n\nWe\'re continuously working to expand our language offerings to make RISE more inclusive and accessible to users worldwide. More languages will be added in future updates as part of our commitment to global usability.',
      open: false
    }
  ];

  m_bVideoOpen = false;
  m_sCurrentVideoUrl = '';

  constructor(private m_oRouter: Router, private m_oElementRef: ElementRef) {}

  openVideo(videoUrl: string): void {
    this.m_sCurrentVideoUrl = videoUrl;
    this.m_bVideoOpen = true;
  }

  closeVideo(): void {
    this.m_bVideoOpen = false;
    this.m_sCurrentVideoUrl = '';
  }

  ngAfterViewInit(): void {
    // Observer for Stay Connected section
    const connectedObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.m_bIsConnectedVisible = true;
        connectedObserver.disconnect();
      }
    }, { threshold: 0.2 });

    const connectedInner = this.m_oElementRef.nativeElement.querySelector('.connected-inner');
    if (connectedInner) {
      connectedObserver.observe(connectedInner);
    }

    // Observer for Tagline typing effect
    const taglineObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.typeTagline();
        taglineObserver.disconnect();
      }
    }, { threshold: 0.8 });

    const taglineElement = this.m_oElementRef.nativeElement.querySelector('.future-tagline');
    if (taglineElement) {
      taglineObserver.observe(taglineElement);
    }
  }

  typeTagline(): void {
    let i = 0;
    this.m_sVisibleTagline = '';

    const typeChar = () => {
      if (i < this.m_sFullTagline.length) {
        this.m_sVisibleTagline += this.m_sFullTagline[i];
        i++;
        setTimeout(typeChar, 40);
      } else {
        // Pause for 3 seconds when finished, then restart
        setTimeout(() => {
          this.m_sVisibleTagline = '';
          i = 0;
          typeChar();
        }, 3000);
      }
    };

    typeChar();
  }

  toggleFaq(index: number): void {
    this.m_aoFaqs[index].open = !this.m_aoFaqs[index].open;
  }

  navigateTo(path: string): void {
    this.m_oRouter.navigateByUrl(path);
  }
}
