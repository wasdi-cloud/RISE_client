import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'rise-textarea-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './rise-textarea-input.component.html',
  styleUrl: './rise-textarea-input.component.css',
})
export class RiseTextareaInputComponent {
  /**
   * Name field for textarea
   */
  @Input() m_sName: string;

  /**
   * Localization key for corresponding translation in i18n
   */
  @Input() m_sLocalizationKey: string = '';

  /**
   * Input text model
   */
  @Input() m_sInputText: string;

  /**
   * Is this input part of a validator (i.e., checking two inputs are the same)
   */
  @Input() m_bIsValidatorInput?: boolean = false;

  /**
   * Is the input valid?
   */
  @Input() m_bIsValid: boolean = true;

  /**
   * Does this textarea have a title input?
   */
  @Input() m_bHasTitle: boolean = false;

  @Output() m_sInputTextChange: EventEmitter<string> =
    new EventEmitter<string>();

  onInputChange() {
    this.m_sInputTextChange.emit(this.m_sInputText);
  }
}
