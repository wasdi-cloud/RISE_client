import { Component, Input } from '@angular/core';

@Component({
  selector: 'rise-alerts-widget',
  standalone: true,
  imports: [],
  templateUrl: './rise-alerts-widget.component.html',
  styleUrl: './rise-alerts-widget.component.css'
})
export class RiseAlertsWidgetComponent {
 @Input() m_aoAlerts: Array<any> = [];
}
