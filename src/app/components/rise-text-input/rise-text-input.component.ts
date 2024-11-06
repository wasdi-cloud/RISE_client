import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'rise-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './rise-text-input.component.html',
  styleUrl: './rise-text-input.component.css',
})
export class RiseTextInputComponent implements OnInit {
  @Input() m_sName: string;
  @Input() m_sLocalizationKey: string = '';
  @Input() m_sType?: 'text' | 'password' = 'text';

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

  @Output() m_sInputTextChange: EventEmitter<string> =
    new EventEmitter<string>();

  m_bSetPassword: boolean = false;

  ngOnInit(): void {
    if (this.m_sType === 'password') {
      this.m_bSetPassword = true;
    }
  }

  toggleType() {
    if (this.m_sType === 'password') {
      this.m_sType = 'text';
    } else {
      this.m_sType = 'password';
    }
  }

  onInputChange() {
    this.m_sInputTextChange.emit(this.m_sInputText);
  }
}
