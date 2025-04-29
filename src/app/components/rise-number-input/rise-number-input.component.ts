import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

  ],
  templateUrl: './rise-number-input.component.html',
  styleUrl: './rise-number-input.component.css'
})
export class RiseNumberInputComponent implements OnInit{
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

  @Input() m_sInputText: string;

  @Input() m_sErrorText?: string = 'The input was not valid';

  @Input() m_bHasIcon: boolean = false;

  @Input() m_sIcon: string = 'search';

  @Input() m_bHasTitle?: boolean = false;

  @Input() m_bRequired?: boolean = false;

  @Input() m_bReadonly?: boolean = false;

  @Output() m_sInputTextChange: EventEmitter<string> =
    new EventEmitter<string>();


// Phone-specific
  m_sPhoneInput: string = '';
  m_sCountryPrefix: string = '+1';

  m_aoCountryPrefixes = [
    { code: '+1', name: 'US/Canada' },
    { code: '+33', name: 'France' },
    { code: '+49', name: 'Germany' },
    { code: '+44', name: 'UK' },
    { code: '+91', name: 'India' },
    { code: '+213', name: 'Algeria' },
    // Add more as needed
  ];

  ngOnInit(): void {
    // if (this.m_sType === 'phone' && this.m_sInputText) {
    //   const match = this.m_aoCountryPrefixes.find((p) => this.m_sInputText.startsWith(p.code));
    //   if (match) {
    //     this.m_sCountryPrefix = match.code;
    //     this.m_sPhoneInput = this.m_sInputText.replace(match.code, '').trim();
    //   } else {
    //     this.m_sPhoneInput = this.m_sInputText;
    //   }
    // }
  }

  onInputChange() {
    // if (this.m_sType === 'phone') {
    //   const fullPhone = `${this.m_sCountryPrefix} ${this.m_sPhoneInput.trim()}`;
    //   this.m_sInputTextChange.emit(fullPhone);
    // } else {
    //   this.m_sInputTextChange.emit(this.m_sInputText);
    // }

    this.m_sInputTextChange.emit(this.m_sInputText);

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
