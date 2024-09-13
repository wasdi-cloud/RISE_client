import { Component, Input } from '@angular/core';

@Component({
  selector: 'rise-button',
  standalone: true,
  imports: [],
  templateUrl: './rise-button.component.html',
  styleUrl: './rise-button.component.css'
})
export class RiseButtonComponent {
  @Input() m_sLabel: string = "default"
}
