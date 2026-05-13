import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';
import { ContactMessageViewModel } from '../../models/ContactMessageViewModel';
import { HelloService } from '../../services/api/hello.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  m_sFirstName = '';
  m_sLastName = '';
  m_sEmail = '';
  m_sCompany = '';
  m_sRole = '';
  m_sHowHeard = '';
  m_sSubject = '';
  m_sMessage = '';

  m_aoHowHeardOptions = [
    'Social Media',
    'Search Engine',
    'Friend / Colleague',
    'Other',
  ];

  m_aoSubjectOptions = [
    'General Inquiry',
    'Sales',
    'Technical Support',
    'Other',
  ];

  constructor(private m_oHelloService: HelloService) {}

  sendMessage(): void {
    if (!this.m_sFirstName || !this.m_sLastName || !this.m_sEmail || !this.m_sMessage) {
      alert('Please fill in all mandatory fields (First Name, Last Name, Email, and Message).');
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
          alert('Message sent successfully!');
        },
        error: () => {
          alert('Failed to send message. Please try again later.');
        },
      }
    );
  }
}
