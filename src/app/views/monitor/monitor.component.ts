import { Component } from '@angular/core';
import { RiseTimebarComponent } from '../../components/rise-timebar/rise-timebar.component';
import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [RiseMapComponent, RiseToolbarComponent, RiseTimebarComponent],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {

}
