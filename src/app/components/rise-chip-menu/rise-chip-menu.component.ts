import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'rise-chip-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rise-chip-menu.component.html',
  styleUrl: './rise-chip-menu.component.css',
})

export class RiseChipMenuComponent {
  @Input() m_sSelectedItem: string = null;
  @Input() m_asItems: Array<string> = [];

  m_bShowOptions: boolean = false;

  @Output() m_oSelectedItem: EventEmitter<string> = new EventEmitter<string>();

  toggleOptions() {
    this.m_bShowOptions = !this.m_bShowOptions;
  }

  selectItem(sItem) {
    this.m_sSelectedItem = sItem;
    this.toggleOptions();
    this.emitSelectedItem(this.m_sSelectedItem);
  }

  emitSelectedItem(sSelectedItem) {
    this.m_oSelectedItem.emit(sSelectedItem);
  }
}
