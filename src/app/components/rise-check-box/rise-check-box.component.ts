import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'rise-check-box',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './rise-check-box.component.html',
  styleUrl: './rise-check-box.component.css'
})
export class RiseCheckBoxComponent {
  @Input() m_aoOptions: string[] = []; // Input for checkbox options
  @Output() m_oSelectionChange = new EventEmitter<any[]>(); // Output for selected values

  m_aoSelectedValues: any[] = []; // Store selected values

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
