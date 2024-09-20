import { Component } from '@angular/core';
import { CesiumDirective } from '../../directives/cesium.directive';

@Component({
  selector: 'rise-globe',
  standalone: true,
  imports: [CesiumDirective],
  templateUrl: './rise-globe.component.html',
  styleUrl: './rise-globe.component.css'
})
export class RiseGlobeComponent {

}
