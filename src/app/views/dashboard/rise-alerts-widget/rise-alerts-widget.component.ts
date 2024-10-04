import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-alerts-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './rise-alerts-widget.component.html',
  styleUrl: './rise-alerts-widget.component.css'
})
export class RiseAlertsWidgetComponent {
  @Input() m_aoAlerts: Array<any> = [];

  m_bShowContent: boolean = true;

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }
}
