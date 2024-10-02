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
  @Input() options: { label: string; value: any }[] = []; // Input for checkbox options
  @Output() selectionChange = new EventEmitter<any[]>(); // Output for selected values

  selectedValues: any[] = []; // Store selected values

  // Method to handle checkbox change
  onCheckboxChange(value: any, event: any) {
    if (event.target.checked) {
      this.selectedValues.push(value);
    } else {
      const index = this.selectedValues.indexOf(value);
      if (index > -1) {
        this.selectedValues.splice(index, 1);
      }
    }
    // Emit the selected values
    this.selectionChange.emit(this.selectedValues);
  }
}
