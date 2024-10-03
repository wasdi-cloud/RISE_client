import { Component, Input } from '@angular/core';

@Component({
  selector: 'rise-layer-item',
  standalone: true,
  imports: [],
  templateUrl: './rise-layer-item.component.html',
  styleUrl: './rise-layer-item.component.css'
})
export class RiseLayerItemComponent {
  @Input() m_oLayer: any;
}
