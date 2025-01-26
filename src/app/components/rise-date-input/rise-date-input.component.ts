import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-date-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './rise-date-input.component.html',
  styleUrl: './rise-date-input.component.css',
})
export class RiseDateInputComponent {
  @Input() m_bHasTitle?: boolean = false;

  @Input() m_sName: string = '';

  @Input() m_sLocalizationKey: string = '';

  @Input() m_bReadonly: boolean = false;

  @Input() m_bRequired: boolean = false;

  @Input() m_sInputDate: any = null;

  @Output() m_sInputDateChange: EventEmitter<any> = new EventEmitter<any>();

  onInputChange() {
    this.m_sInputDateChange.emit(this.m_sInputDate)
  }
}
