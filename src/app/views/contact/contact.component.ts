import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

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
    'Search Engine', 'Social Media', 'Colleague or Friend', 'Conference or Event', 'Other'
  ];

  m_aoSubjectOptions = [
    'General Inquiry', 'Pricing', 'Technical Support', 'Partnership', 'Press', 'Other'
  ];

  sendMessage(): void {
    if (!this.m_sFirstName || !this.m_sLastName || !this.m_sEmail) {
      alert('Please fill in all mandatory fields (First Name, Last Name, and Email).');
      return;
    }

    const subject = encodeURIComponent(this.m_sSubject || 'Contact from RISE website');
    const body = encodeURIComponent(
      `Name: ${this.m_sFirstName} ${this.m_sLastName}\n` +
      `Email: ${this.m_sEmail}\n` +
      `Company: ${this.m_sCompany}\n` +
      `Role: ${this.m_sRole}\n` +
      `How heard: ${this.m_sHowHeard}\n\n` +
      this.m_sMessage
    );
    window.location.href = `mailto:info@wasdi.cloud?subject=${subject}&body=${body}`;
  }
}
