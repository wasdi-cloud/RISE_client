import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import { CheckboxInput } from './checkbox-input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-checkbox',
  standalone: true,
  imports: [TranslateModule, NgForOf],
  templateUrl: './rise-checkbox.component.html',
  styleUrl: './rise-checkbox.component.css',
})
export class RiseCheckboxComponent implements OnInit {
  @Input() m_aoOptions: Array<CheckboxInput> = [];
  @Output() m_oSelectionChange = new EventEmitter<Array<any>>();

  m_aoSelectedValues: any[] = [];

  ngOnInit() {
    console.log(this.m_aoOptions);
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
}
