import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'rise-layer-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rise-layer-item.component.html',
  styleUrl: './rise-layer-item.component.css',
})
export class RiseLayerItemComponent {
  @Input() m_oLayer: any;
}
