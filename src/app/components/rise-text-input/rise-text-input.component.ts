import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class RiseTextInputComponent {
  @Input() m_sName: string;
  @Input() m_sLocalizationKey: string = 'TEST';
  @Input() m_sType: 'text' | 'password' = 'text';

  /**
   * Is this input part of a validator (i.e., checking two inputs are the same)
   */
  @Input() m_bIsValidatorInput?: boolean = false;

  /**
   * Is the input valid?
   */
  @Input() m_bIsValid: boolean = true;

  @Input() m_sInputText: string;

  @Input() m_bHasIcon: boolean = false;

  @Input() m_sIcon: string = 'search';

  @Output() m_sInputTextChange: EventEmitter<string> =
    new EventEmitter<string>();

  onInputChange() {
    this.m_sInputTextChange.emit(this.m_sInputText);
  }
}
