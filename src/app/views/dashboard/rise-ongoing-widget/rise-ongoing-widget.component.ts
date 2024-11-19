import { Component, Input, OnInit } from '@angular/core';
import { EventViewModel } from '../../../models/EventViewModel';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RiseBadgeComponent } from '../../../components/rise-badge/rise-badge.component';

@Component({
  selector: 'rise-ongoing-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule, RiseBadgeComponent],
  templateUrl: './rise-ongoing-widget.component.html',
  styleUrl: './rise-ongoing-widget.component.css',
})
export class RiseOngoingWidgetComponent implements OnInit {
  @Input() m_aoOngoingEvent: Array<EventViewModel> = [];

  testEvent: EventViewModel = {
    name: 'Madagascar',
    id: '',
    startDate: Date.now(),
    endDate: 0,
    type: 'Flood',
    bbox: '',
    peakDate: 0,
  };

  m_bShowContent: boolean = true;

  ngOnInit(): void {
    // this.m_aoOngoingEvent.push(this.testEvent);
  }

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }
}
