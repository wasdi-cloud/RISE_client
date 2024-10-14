import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';

@Component({
  selector: 'account-sidebar',
  standalone: true,
  imports: [CommonModule, RiseButtonComponent],
  templateUrl: './account-sidebar.component.html',
  styleUrl: './account-sidebar.component.css',
})
export class AccountSidebarComponent {
  @Input() m_aoAccountButtons = [];

  @Output() m_sSelectedButton: EventEmitter<any> = new EventEmitter<any>(null);

  constructor() {}

  emitButtonSelection(sSelectedBtn: string) {
    this.m_sSelectedButton.emit(sSelectedBtn);
  }
}
