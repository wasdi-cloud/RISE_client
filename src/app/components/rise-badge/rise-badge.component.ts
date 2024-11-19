import { Component, Input } from '@angular/core';

@Component({
  selector: 'rise-badge',
  standalone: true,
  imports: [],
  templateUrl: './rise-badge.component.html',
  styleUrl: './rise-badge.component.css',
})
export class RiseBadgeComponent {
  @Input() m_iDisplayNum: number = 0;
}
