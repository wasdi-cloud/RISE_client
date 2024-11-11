import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiseMenuButtonComponent } from '../../../components/rise-menu-button/rise-menu-button.component';

@Component({
  selector: 'account-sidebar',
  standalone: true,
  imports: [CommonModule, RiseMenuButtonComponent],
  templateUrl: './account-sidebar.component.html',
  styleUrl: './account-sidebar.component.css',
})
export class AccountSidebarComponent {
  @Input() m_aoAccountButtons = [];
  @Output() m_sSelectedButton: EventEmitter<any> = new EventEmitter<any>(null);
  m_sActiveBtn: string = 'user';

  constructor() {}

  emitButtonSelection(sSelectedBtn: string) {
    this.m_sActiveBtn = sSelectedBtn;
    this.m_sSelectedButton.emit(sSelectedBtn);
  }
}
