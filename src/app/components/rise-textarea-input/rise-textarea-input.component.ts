import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'rise-textarea-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './rise-textarea-input.component.html',
  styleUrl: './rise-textarea-input.component.css'
})
export class RiseTextareaInputComponent {
  @Input() m_sName: string;
  @Input() m_sLocalizationKey: string = "TEST";
  @Input() m_sInputText: string;
  @Output() m_sInputTextChange: EventEmitter<string> = new EventEmitter<string>();

  onInputChange() {
    this.m_sInputTextChange.emit(this.m_sInputText);
  }
}
