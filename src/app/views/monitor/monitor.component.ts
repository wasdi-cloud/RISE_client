import { Component } from '@angular/core';
import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseGlobeComponent } from '../../components/rise-globe/rise-globe.component';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [RiseMapComponent, RiseToolbarComponent, RiseGlobeComponent],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {
  m_bShow2D: boolean = false;
}
