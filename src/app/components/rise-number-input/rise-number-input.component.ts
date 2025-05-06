import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'rise-number-input',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    TranslateModule,
    NgForOf,

  ],
  templateUrl: './rise-number-input.component.html',
  styleUrl: './rise-number-input.component.css'
})
export class RiseNumberInputComponent implements OnInit,OnChanges {

  constructor(private m_oChangeDetectorReference: ChangeDetectorRef) {}

  @Input() m_sName: string;
  @Input() m_sLocalizationKey: string = '';
  @Input() m_sType?: 'number' | 'phone' = 'number';

  /**
   * Is this input part of a validator (i.e., checking two inputs are the same)
   */
  @Input() m_bIsValidatorInput?: boolean = false;

  /**
   * Is the input valid?
   */
  @Input() m_bIsValid: boolean = true;

  @Input() m_sPhonePrefix: string = '+1';
  @Output() m_sPhonePrefixChange = new EventEmitter<string>();

  @Input() m_sPhoneNumber: string = '';
  @Output() m_sPhoneNumberChange = new EventEmitter<string>();

// Optional for type='number'
  @Input() m_sInputText: string = '';
  @Output() m_sInputTextChange = new EventEmitter<string>();


  @Input() m_sErrorText?: string = 'The input was not valid';

  @Input() m_bHasIcon: boolean = false;

  @Input() m_sIcon: string = 'search';

  @Input() m_bHasTitle?: boolean = false;

  @Input() m_bRequired?: boolean = false;

  @Input() m_bReadonly?: boolean = false;

// Phone-specific
  m_sPhoneInput: string = '';
  m_sCountryPrefix: string = '+1';

  m_aoCountryPrefixes = [
    { code: '+93', name: 'Afghanistan' },
    { code: '+355', name: 'Albania' },
    { code: '+213', name: 'Algeria' },
    { code: '+376', name: 'Andorra' },
    { code: '+244', name: 'Angola' },
    { code: '+61', name: 'Australia' },
    { code: '+43', name: 'Austria' },
    { code: '+32', name: 'Belgium' },
    { code: '+229', name: 'Benin' },
    { code: '+267', name: 'Botswana' },
    { code: '+55', name: 'Brazil' },
    { code: '+359', name: 'Bulgaria' },
    { code: '+226', name: 'Burkina Faso' },
    { code: '+257', name: 'Burundi' },
    { code: '+237', name: 'Cameroon' },
    { code: '+1', name: 'Canada' },
    { code: '+238', name: 'Cape Verde' },
    { code: '+86', name: 'China' },
    { code: '+269', name: 'Comoros' },
    { code: '+242', name: 'Congo (Brazzaville)' },
    { code: '+243', name: 'Congo (Kinshasa)' },
    { code: '+420', name: 'Czech Republic' },
    { code: '+45', name: 'Denmark' },
    { code: '+253', name: 'Djibouti' },
    { code: '+20', name: 'Egypt' },
    { code: '+372', name: 'Estonia' },
    { code: '+251', name: 'Ethiopia' },
    { code: '+358', name: 'Finland' },
    { code: '+33', name: 'FR' },
    { code: '+39', name: 'Italy' },
    { code: '+220', name: 'Gambia' },
    { code: '+49', name: 'GER' },
    { code: '+233', name: 'Ghana' },
    { code: '+30', name: 'Greece' },
    { code: '+224', name: 'Guinea' },
    { code: '+245', name: 'Guinea-Bissau' },
    { code: '+36', name: 'Hungary' },
    { code: '+91', name: 'IND' },
    { code: '+213', name: 'Algeria' },
    { code: '+39', name: 'Italy' },
    { code: '+81', name: 'Japan' },
    { code: '+254', name: 'Kenya' },
    { code: '+371', name: 'Latvia' },
    { code: '+370', name: 'Lithuania' },
    { code: '+352', name: 'LUX' },
    { code: '+261', name: 'Madagascar' },
    { code: '+265', name: 'Malawi' },
    { code: '+223', name: 'Mali' },
    { code: '+230', name: 'Mauritius' },
    { code: '+212', name: 'Morocco' },
    { code: '+258', name: 'Mozambique' },
    { code: '+31', name: 'Netherlands' },
    { code: '+64', name: 'New Zealand' },
    { code: '+227', name: 'Niger' },
    { code: '+234', name: 'Nigeria' },
    { code: '+47', name: 'Norway' },
    { code: '+48', name: 'Poland' },
    { code: '+351', name: 'Portugal' },
    { code: '+7', name: 'Russia' },
    { code: '+250', name: 'Rwanda' },
    { code: '+221', name: 'Senegal' },
    { code: '+381', name: 'Serbia' },
    { code: '+248', name: 'Seychelles' },
    { code: '+232', name: 'Sierra Leone' },
    { code: '+421', name: 'Slovakia' },
    { code: '+386', name: 'Slovenia' },
    { code: '+27', name: 'South Africa' },
    { code: '+82', name: 'South Korea' },
    { code: '+34', name: 'Spain' },
    { code: '+249', name: 'Sudan' },
    { code: '+46', name: 'Sweden' },
    { code: '+41', name: 'Switzerland' },
    { code: '+255', name: 'Tanzania' },
    { code: '+228', name: 'Togo' },
    { code: '+216', name: 'Tunisia' },
    { code: '+90', name: 'Turkey' },
    { code: '+256', name: 'Uganda' },
    { code: '+44', name: 'UK' },
    { code: '+1', name: 'US' },
    { code: '+260', name: 'Zambia' },
    { code: '+263', name: 'Zimbabwe' }
  ];

  ngOnInit(): void {
    this.syncPhoneValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.m_sType === 'phone') {
      this.syncPhoneValues();
    }
  }

  private syncPhoneValues(): void {
    if (this.m_sPhonePrefix) {
      this.m_sCountryPrefix = this.m_sPhonePrefix;
    }
    if (this.m_sPhoneNumber) {
      this.m_sPhoneInput = this.m_sPhoneNumber;
    }

    this.m_oChangeDetectorReference.detectChanges();
  }

  onInputChange(): void {
    this.m_sPhonePrefixChange.emit(this.m_sCountryPrefix);
    this.m_sPhoneNumberChange.emit(this.m_sPhoneInput.trim());
  }


  onNumberKeyPress(event: KeyboardEvent): void {
    const charCode = event.key;
    if (!/^\d$/.test(charCode)) {
      event.preventDefault();
    }
  }

  onNumberPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }


}
