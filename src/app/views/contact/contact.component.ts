import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';
import { ContactMessageViewModel } from '../../models/ContactMessageViewModel';
import { HelloService } from '../../services/api/hello.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicNavbarComponent, PublicFooterComponent, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit, OnDestroy {
  m_sFirstName = '';
  m_sLastName = '';
  m_sEmail = '';
  m_sCompany = '';
  m_sRole = '';
  m_sHowHeard = '';
  m_sSubject = '';
  m_sMessage = '';

  m_aoHowHeardOptions: string[] = [];
  m_aoSubjectOptions: string[] = [];

  private m_oLangSubscription: Subscription | null = null;

  constructor(private m_oHelloService: HelloService, private m_oTranslateService: TranslateService) {}

  ngOnInit(): void {
    this.loadOptions();
    this.m_oLangSubscription = this.m_oTranslateService.onLangChange.subscribe(() => {
      this.loadOptions();
    });
  }

  ngOnDestroy(): void {
    if (this.m_oLangSubscription) {
      this.m_oLangSubscription.unsubscribe();
    }
  }

  private loadOptions(): void {
    this.m_aoHowHeardOptions = [
      this.m_oTranslateService.instant('CONTACT.OPT_SOCIAL') || 'Social Media',
      this.m_oTranslateService.instant('CONTACT.OPT_SEARCH') || 'Search Engine',
      this.m_oTranslateService.instant('CONTACT.OPT_FRIEND') || 'Friend / Colleague',
      this.m_oTranslateService.instant('CONTACT.OPT_OTHER') || 'Other',
    ];

    this.m_aoSubjectOptions = [
      this.m_oTranslateService.instant('CONTACT.SUB_GENERAL') || 'General Inquiry',
      this.m_oTranslateService.instant('CONTACT.SUB_SALES') || 'Sales',
      this.m_oTranslateService.instant('CONTACT.SUB_TECH') || 'Technical Support',
      this.m_oTranslateService.instant('CONTACT.OPT_OTHER') || 'Other',
    ];
  }

  sendMessage(): void {
    if (!this.m_sFirstName || !this.m_sLastName || !this.m_sEmail || !this.m_sMessage) {
      alert(this.m_oTranslateService.instant('CONTACT.ALERT_FILL_MANDATORY') || 'Please fill in all mandatory fields (First Name, Last Name, Email, and Message).');
      return;
    }

    const oContactMessage: ContactMessageViewModel = {
      name: this.m_sFirstName,
      surname: this.m_sLastName,
      email: this.m_sEmail,
      company: this.m_sCompany,
      role: this.m_sRole,
      heardAbout: this.m_sHowHeard,
      subject: this.m_sSubject,
      message: this.m_sMessage,
    };

    this.m_oHelloService.contact(oContactMessage).subscribe(
      {
        next: () => {
          alert(this.m_oTranslateService.instant('CONTACT.ALERT_SENT_SUCCESS') || 'Message sent successfully!');
        },
        error: () => {
          alert(this.m_oTranslateService.instant('CONTACT.ALERT_SENT_FAIL') || 'Failed to send message. Please try again later.');
        },
      }
    );
  }
}
