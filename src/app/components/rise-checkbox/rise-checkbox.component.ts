import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import { CheckboxInput } from './checkbox-input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-checkbox',
  standalone: true,
  imports: [TranslateModule, NgForOf, NgIf],
  templateUrl: './rise-checkbox.component.html',
  styleUrl: './rise-checkbox.component.css',
})
export class RiseCheckboxComponent implements OnChanges {
  @Input() m_aoOptions: Array<CheckboxInput> = [];
  @Output() m_oSelectionChange = new EventEmitter<Array<any>>();
  @Input() m_aoSelectedValues: any[] = []; // Input for selected values
  @Input() m_bReadonly: boolean = false;
  /*
    a flag to enable select all
   */

  @Input() m_bEnableSelectAll: boolean = false;
  resetKey: number = 0; // Trigger reset on key change

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetKey']) {
      // Reset selected values visually and emit the change
      this.m_aoSelectedValues = [];
      this.m_oSelectionChange.emit(this.m_aoSelectedValues);
    }
  }
  // Method to handle checkbox change
  onCheckboxChange(value: any, event: any) {
    if (event.target.checked) {
      this.m_aoSelectedValues.push(value);
    } else {
      const index = this.m_aoSelectedValues.indexOf(value);
      if (index > -1) {
        this.m_aoSelectedValues.splice(index, 1);
      }
    }
    // Emit the selected values
    this.m_oSelectionChange.emit(this.m_aoSelectedValues);
  }

  // Method to check if all items are selected
  isAllSelected(): boolean {
    return this.m_aoSelectedValues.length === this.m_aoOptions.length;
  }

  // Method to toggle select all / unselect all
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.m_aoSelectedValues = [];
    } else {
      this.m_aoSelectedValues = this.m_aoOptions.map(option => option.value);
    }
    // Emit the updated selection manually
    this.m_oSelectionChange.emit(this.m_aoSelectedValues);
  }
}
