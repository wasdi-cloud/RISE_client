import { Component, Input } from '@angular/core';
import { EventViewModel } from '../../../models/EventViewModel';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-ongoing-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './rise-ongoing-widget.component.html',
  styleUrl: './rise-ongoing-widget.component.css',
})
export class RiseOngoingWidgetComponent {
  @Input() m_aoOngoingEvent: Array<EventViewModel> = [];

  m_bShowContent: boolean = true;

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }
}
