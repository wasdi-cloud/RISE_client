import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventViewModel } from '../../../models/EventViewModel';

@Component({
  selector: 'rise-alerts-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './rise-alerts-widget.component.html',
  styleUrl: './rise-alerts-widget.component.css',
})
export class RiseAlertsWidgetComponent implements OnInit {
  @Input() m_aoAlerts: Array<any> = [];

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
    // this.m_aoAlerts.push(this.testEvent);
  }

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }
}
