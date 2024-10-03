import { Component, Input } from '@angular/core';
import { Event } from '../../../shared/models/event';

@Component({
  selector: 'rise-ongoing-widget',
  standalone: true,
  imports: [],
  templateUrl: './rise-ongoing-widget.component.html',
  styleUrl: './rise-ongoing-widget.component.css'
})
export class RiseOngoingWidgetComponent {
  @Input() m_aoOngoingEvent: Array<Event> =[];
}
