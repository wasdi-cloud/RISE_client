import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";

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
export class RiseNumberInputComponent implements OnInit,OnChanges{
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
    { code: '+1', name: 'US/Canada' },
    { code: '+33', name: 'France' },
    { code: '+39', name: 'Italy' },
    { code: '+49', name: 'Germany' },
    { code: '+44', name: 'UK' },
    { code: '+91', name: 'India' },
    { code: '+213', name: 'Algeria' },
    { code: '+352', name: 'Luxembourg' },
    // Add more as needed
  ];

  ngOnInit(): void {
    console.log(this.m_sPhoneNumber)
    console.log(this.m_sPhonePrefix)
    this.syncPhoneValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.m_sType === 'phone') {
      console.log(this.m_sPhoneNumber)
      console.log(this.m_sPhonePrefix)
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
